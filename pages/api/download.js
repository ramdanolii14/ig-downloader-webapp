// --- Rate limiting -----------------------------------------------------
// In-memory per-IP limiter. This protects a single running Node process
// (e.g. `npm run dev`, or one VPS/PM2 instance) from spam clicks and
// scripted abuse hitting the SocialKit API quota. It does NOT
// share state across multiple serverless instances — if you deploy to
// Vercel with multiple concurrent lambdas, use a shared store like
// Upstash Redis instead for a hard guarantee.
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 6; // max 6 downloads per IP per minute
const MIN_INTERVAL_MS = 2000; // minimum 2s between requests per IP (blocks double/spam clicks)

const rateLimitStore = new Map(); // ip -> { timestamps: number[], lastRequest: number }

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

function checkRateLimit(ip) {
  const now = Date.now();
  let entry = rateLimitStore.get(ip);
  if (!entry) {
    entry = { timestamps: [], lastRequest: 0 };
    rateLimitStore.set(ip, entry);
  }

  if (now - entry.lastRequest < MIN_INTERVAL_MS) {
    return {
      allowed: false,
      reason: 'too_fast',
      retryAfter: Math.ceil((MIN_INTERVAL_MS - (now - entry.lastRequest)) / 1000)
    };
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (entry.timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000);
    return { allowed: false, reason: 'rate_limited', retryAfter };
  }

  entry.timestamps.push(now);
  entry.lastRequest = now;
  return { allowed: true };
}

// Periodic cleanup so the map doesn't grow forever on a long-running process.
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitStore.entries()) {
    if (now - entry.lastRequest > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);
if (typeof cleanupTimer.unref === 'function') cleanupTimer.unref();
// -------------------------------------------------------------------

function extractShortcode(url) {
  const match = url.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9-_]+)/);
  return match ? match[1] : null;
}

function extractUsernameFromUrl(url) {
  // Matches instagram.com/<username>/p|reel|reels|tv/<shortcode>
  // Skips reserved path segments that aren't real usernames (e.g. /reel/<code> with no username).
  const match = url.match(/instagram\.com\/([A-Za-z0-9_.]+)\/(?:p|reel|reels|tv)\//);
  if (!match) return null;
  const candidate = match[1];
  const reserved = ['p', 'reel', 'reels', 'tv', 'stories'];
  if (reserved.includes(candidate.toLowerCase())) return null;
  return sanitizeUsername(candidate);
}

function sanitizeUsername(name) {
  if (!name || typeof name !== 'string') return null;
  const cleaned = name.trim().replace(/[^a-zA-Z0-9._-]/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PROVIDER_TIMEOUT_MS = 12000;
const PROVIDER_MAX_ATTEMPTS = 2;

async function requestProviderJson(url, options, provider) {
  for (let attempt = 1; attempt <= PROVIDER_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS)
      });
      const body = await response.text();

      console.log('[' + provider + '] status:', response.status);

      if (!response.ok) {
        console.log('[' + provider + '] body preview:', body.slice(0, 250));

        const retryable =
          response.status === 429 ||
          [500, 502, 503, 504].includes(response.status);

        if (retryable && attempt < PROVIDER_MAX_ATTEMPTS) {
          const retryAfterSeconds = Number(response.headers.get('retry-after'));
          const retryDelay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
            ? Math.min(retryAfterSeconds * 1000, 2000)
            : 750;

          console.log('[' + provider + '] retrying after temporary HTTP error');
          await delay(retryDelay);
          continue;
        }

        return {
          json: null,
          status: response.status,
          temporarilyUnavailable: retryable
        };
      }

      try {
        return {
          json: JSON.parse(body),
          status: response.status,
          temporarilyUnavailable: false
        };
      } catch {
        console.log('[' + provider + '] response was not valid JSON');
        return {
          json: null,
          status: response.status,
          temporarilyUnavailable: false
        };
      }
    } catch (error) {
      console.log('[' + provider + '] request error:', error.message);

      if (attempt < PROVIDER_MAX_ATTEMPTS) {
        await delay(500);
        continue;
      }
    }
  }

  return {
    json: null,
    status: 0,
    temporarilyUnavailable: true
  };
}

function isHttpsMediaUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return false;

  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

async function fetchFromSocialKit(url) {
  const accessKey = process.env.SOCIALKIT_ACCESS_KEY;
  if (!accessKey) {
    console.log('[fetchFromSocialKit] skipped, no access key set');
    return { result: null, temporarilyUnavailable: false };
  }

  const response = await requestProviderJson(
    'https://api.socialkit.dev/instagram/download',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-access-key': accessKey
      },
      body: JSON.stringify({
        url,
        format: 'mp4',
        quality: '720p'
      })
    },
    'fetchFromSocialKit'
  );

  const data = response.json?.data;
  const downloadUrl = data?.downloadUrl;

  if (!response.json?.success || !isHttpsMediaUrl(downloadUrl)) {
    if (response.json?.message) {
      console.log('[fetchFromSocialKit] provider message:', response.json.message);
    } else if (response.json?.error) {
      console.log('[fetchFromSocialKit] provider error:', response.json.error);
    } else {
      console.log('[fetchFromSocialKit] no usable video URL returned');
    }

    return {
      result: null,
      temporarilyUnavailable: response.temporarilyUnavailable
    };
  }

  const username = sanitizeUsername(
    data.username ||
    data.author?.username ||
    data.uploader ||
    null
  );

  return {
    result: {
      username,
      items: [{ type: 'video', mediaUrl: downloadUrl }]
    },
    temporarilyUnavailable: false
  };
}

// Fallback for public single-photo posts and video URLs when the download
// endpoint is temporarily unavailable. SocialKit documents thumbnail URLs
// for photos/carousels and videoUrl for videos. Carousel children are not
// exposed by this endpoint, so we do not pretend the cover is every slide.
async function fetchFromSocialKitStats(url) {
  const accessKey = process.env.SOCIALKIT_ACCESS_KEY;
  if (!accessKey) {
    console.log('[fetchFromSocialKitStats] skipped, no access key set');
    return { result: null, temporarilyUnavailable: false };
  }

  const endpoint = new URL('https://api.socialkit.dev/instagram/stats');
  endpoint.searchParams.set('url', url);

  const response = await requestProviderJson(
    endpoint.toString(),
    {
      method: 'GET',
      headers: { 'x-access-key': accessKey }
    },
    'fetchFromSocialKitStats'
  );

  const data = response.json?.data;
  if (!response.json?.success || !data) {
    return {
      result: null,
      temporarilyUnavailable: response.temporarilyUnavailable
    };
  }

  if (data.contentType === 'carousel') {
    console.log('[fetchFromSocialKitStats] carousel detected; API only documents the cover thumbnail');
    return {
      result: null,
      temporarilyUnavailable: false,
      unsupportedCarousel: true
    };
  }

  const username = sanitizeUsername(data.author || data.username || null);

  if (data.isVideo === true && isHttpsMediaUrl(data.videoUrl)) {
    return {
      result: {
        username,
        items: [{ type: 'video', mediaUrl: data.videoUrl }]
      },
      temporarilyUnavailable: false
    };
  }

  if (data.isVideo === false && isHttpsMediaUrl(data.thumbnail)) {
    return {
      result: {
        username,
        items: [{ type: 'image', mediaUrl: data.thumbnail }]
      },
      temporarilyUnavailable: false
    };
  }

  console.log('[fetchFromSocialKitStats] no supported media URL in response');
  return {
    result: null,
    temporarilyUnavailable: false
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientIp = getClientIp(req);
  const rateCheck = checkRateLimit(clientIp);

  if (!rateCheck.allowed) {
    console.log(`[handler] rate limit hit for ${clientIp}: ${rateCheck.reason}`);
    res.setHeader('Retry-After', String(rateCheck.retryAfter));
    return res.status(429).json({
      error:
        rateCheck.reason === 'too_fast'
          ? 'You are clicking too fast. Please wait a moment and try again.'
          : `Too many requests from this device. Try again in ${rateCheck.retryAfter} seconds.`,
      retryAfter: rateCheck.retryAfter
    });
  }

  const { url } = req.body || {};

  if (typeof url !== 'string' || !url.trim()) {
    return res.status(400).json({ error: 'Invalid Instagram URL' });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    return res.status(400).json({ error: 'Invalid Instagram URL' });
  }

  const allowedHosts = ['instagram.com', 'www.instagram.com', 'm.instagram.com'];
  if (!allowedHosts.includes(parsedUrl.hostname.toLowerCase())) {
    return res.status(400).json({ error: 'Please enter a valid Instagram post URL' });
  }

  const shortcode = extractShortcode(url);

  if (!shortcode) {
    return res.status(400).json({ error: 'Unrecognized URL format' });
  }

  console.log('[handler] shortcode:', shortcode);
  console.log('[handler] socialkit key set:', Boolean(process.env.SOCIALKIT_ACCESS_KEY));

  try {
    const downloadResponse = await fetchFromSocialKit(url);
    let result = downloadResponse.result;
    let providerUnavailable = downloadResponse.temporarilyUnavailable;
    let unsupportedCarousel = false;

    if (!result) {
      const statsResponse = await fetchFromSocialKitStats(url);
      result = statsResponse.result;
      providerUnavailable = providerUnavailable || statsResponse.temporarilyUnavailable;
      unsupportedCarousel = statsResponse.unsupportedCarousel === true;
    }

    if (!result || !result.items || result.items.length === 0) {
      if (unsupportedCarousel) {
        return res.status(422).json({
          error: 'This provider currently returns only a carousel cover image, not every slide. Try a single photo or video post instead.'
        });
      }

      if (providerUnavailable) {
        return res.status(503).json({
          error: 'The Instagram media service is temporarily unavailable. Please try again in a minute.'
        });
      }

      return res.status(404).json({
        error: 'Media could not be found. Make sure the post is public and the link is still available.'
      });
    }

    const baseName = result.username || extractUsernameFromUrl(url) || 'instagram';
    console.log('[handler] final baseName used for filename:', baseName);
    const items = result.items.map((item) => ({
      ...item,
      filename: baseName
    }));

    return res.status(200).json({ items });
  } catch (err) {
    console.log('[handler] error:', err.message);
    return res.status(500).json({ error: 'Something went wrong while fetching the data' });
  }
}