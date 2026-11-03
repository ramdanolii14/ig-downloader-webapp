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

function extractUsernameFromProfileUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  try {
    const parsed = new URL(value);
    const allowedHosts = ['instagram.com', 'www.instagram.com', 'm.instagram.com'];
    if (!allowedHosts.includes(parsed.hostname.toLowerCase())) return null;

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length !== 1) return null;

    const candidate = segments[0];
    const reserved = ['p', 'reel', 'reels', 'tv', 'stories', 'explore', 'accounts'];
    if (reserved.includes(candidate.toLowerCase())) return null;

    return sanitizeUsername(candidate);
  } catch {
    return null;
  }
}

function resolveProviderUsername(data) {
  if (!data || typeof data !== 'object') return null;

  const author = typeof data.author === 'string'
    ? data.author
    : data.author?.username;

  const candidates = [
    data.username,
    author,
    data.author?.username,
    data.owner?.username,
    data.user?.username,
    data.creator?.username,
    data.uploader
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || /^https?:\/\//i.test(candidate)) continue;
    const username = sanitizeUsername(candidate);
    if (username) return username;
  }

  return extractUsernameFromProfileUrl(
    data.authorLink ||
    data.profileUrl ||
    data.author?.url ||
    data.owner?.profileUrl ||
    data.owner?.url ||
    null
  );
}

function getProviderErrorCode(payload) {
  return String(
    payload?.errorCode ||
    payload?.code ||
    payload?.error?.code ||
    payload?.data?.errorCode ||
    ''
  ).toLowerCase();
}

function isTemporaryProviderFailure(payload, status = 0) {
  if (status === 429 || status >= 500) return true;
  if (payload?.retryable === true || payload?.data?.retryable === true) return true;

  const code = getProviderErrorCode(payload);
  if (
    code.includes('temporary') ||
    code.includes('temporarily') ||
    code.includes('extraction_failed') ||
    code.includes('upstream_blocked') ||
    code.includes('upstream_unavailable') ||
    code.includes('timeout') ||
    code.includes('rate_limit')
  ) {
    return true;
  }

  const message = String(payload?.message || payload?.error?.message || '').toLowerCase();
  return (
    message.includes('try again later') ||
    message.includes('retry later') ||
    message.includes('temporarily unavailable') ||
    message.includes('couldn’t complete this request') ||
    message.includes("couldn't complete this request") ||
    message.includes('upstream unavailable') ||
    message.includes('timed out')
  );
}

function isProviderFailure(payload) {
  return Boolean(
    payload &&
    typeof payload === 'object' &&
    (payload.success === false || payload.error || payload.code || payload.errorCode)
  );
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

      let json = null;
      try {
        json = JSON.parse(body);
      } catch {
        // Keep the raw HTTP status when an upstream proxy returns HTML or text.
      }

      const retryable = isTemporaryProviderFailure(json, response.status);
      const retryAfterSeconds = Number(response.headers.get('retry-after'));

      if (!response.ok) {
        console.log('[' + provider + '] body preview:', body.slice(0, 250));

        // Do not rapidly retry Instagram extraction failures. SocialKit asks
        // clients to wait on temporary 503 responses; return the typed failure
        // to our caller instead of converting it into a false "not found".
        const safeToRetryImmediately =
          response.status === 502 ||
          response.status === 504;

        if (safeToRetryImmediately && attempt < PROVIDER_MAX_ATTEMPTS) {
          console.log('[' + provider + '] retrying after transient gateway error');
          await delay(750);
          continue;
        }

        return {
          json,
          status: response.status,
          temporarilyUnavailable: retryable,
          providerError: true,
          retryAfterSeconds: Number.isFinite(retryAfterSeconds) ? retryAfterSeconds : null
        };
      }

      if (json === null) {
        console.log('[' + provider + '] response was not valid JSON');
        return {
          json: null,
          status: response.status,
          temporarilyUnavailable: false,
          providerError: true
        };
      }

      const apiFailure = isProviderFailure(json);
      const apiTemporarilyUnavailable = isTemporaryProviderFailure(json, response.status);

      if (apiFailure) {
        console.log('[' + provider + '] API reported failure:', getProviderErrorCode(json) || 'unclassified');
      }

      return {
        json,
        status: response.status,
        temporarilyUnavailable: apiTemporarilyUnavailable,
        providerError: apiFailure
      };
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
    return { result: null, temporarilyUnavailable: false, providerError: true };
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
        access_key: accessKey,
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
      temporarilyUnavailable: response.temporarilyUnavailable,
      providerError: true,
      retryAfterSeconds: response.retryAfterSeconds || null
    };
  }

  const username = resolveProviderUsername(data);

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
      temporarilyUnavailable: response.temporarilyUnavailable,
      providerError: true,
      retryAfterSeconds: response.retryAfterSeconds || null
    };
  }

  if (data.contentType === 'carousel' || data.contentType === 'carousel_container') {
    console.log('[fetchFromSocialKitStats] carousel detected; resolving all available image slides from channel-posts');
    return {
      result: null,
      username: resolveProviderUsername(data),
      temporarilyUnavailable: false,
      unsupportedCarousel: true
    };
  }

  const username = resolveProviderUsername(data);

  if (data.isVideo === true && isHttpsMediaUrl(data.videoUrl)) {
    return {
      username,
      result: {
        username,
        items: [{ type: 'video', mediaUrl: data.videoUrl }]
      },
      temporarilyUnavailable: false
    };
  }

  if (data.isVideo === false && isHttpsMediaUrl(data.thumbnail)) {
    return {
      username,
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
    temporarilyUnavailable: false,
    providerError: true
  };
}

function readImageUrl(entry, depth = 0) {
  if (typeof entry === 'string') return isHttpsMediaUrl(entry) ? entry : null;
  if (!entry || typeof entry !== 'object' || depth > 3) return null;

  const urlKeys = [
    'url',
    'imageUrl',
    'mediaUrl',
    'src',
    'displayUrl',
    'thumbnailUrl',
    'image_url',
    'media_url'
  ];

  for (const key of urlKeys) {
    if (isHttpsMediaUrl(entry[key])) return entry[key];
  }

  const nestedKeys = ['image', 'media', 'source', 'asset', 'download'];
  for (const key of nestedKeys) {
    const nestedUrl = readImageUrl(entry[key], depth + 1);
    if (nestedUrl) return nestedUrl;
  }

  return null;
}

function buildCarouselImageItems(post) {
  const collection = Array.isArray(post?.imageCollection)
    ? post.imageCollection
    : Array.isArray(post?.imageCollection?.items)
      ? post.imageCollection.items
      : Array.isArray(post?.imageCollection?.images)
        ? post.imageCollection.images
        : [];

  const available = collection
    .filter((entry) => entry && String(entry.status || '').toLowerCase() === 'available')
    .map((entry, index) => ({
      entry,
      index,
      position: entry.position !== null && entry.position !== undefined && entry.position !== '' && Number.isInteger(Number(entry.position))
        ? Number(entry.position)
        : null,
      mediaUrl: readImageUrl(entry)
    }))
    .filter((item) => item.mediaUrl);

  const orderIsSource = post?.imageCollection?.order === 'source' ||
    post?.imageCollection?.metadata?.order === 'source';
  if (orderIsSource) {
    available.sort((a, b) => {
      if (a.position === null && b.position === null) return a.index - b.index;
      if (a.position === null) return 1;
      if (b.position === null) return -1;
      return a.position - b.position || a.index - b.index;
    });
  }

  return available.map((item) => ({
    type: 'image',
    mediaUrl: item.mediaUrl,
    ...(orderIsSource && item.position !== null ? { position: item.position } : {})
  }));
}

// SocialKit exposes carousel image slides through imageCollection on the
// Channel Posts endpoint. It is a profile-feed endpoint, so use the author
// returned by Stats, then match the exact shortcode. Limit pagination to
// five pages (100 posts) to avoid unbounded provider requests/credit usage.
async function fetchCarouselFromSocialKit(username, shortcode) {
  if (!username) {
    console.log('[fetchCarouselFromSocialKit] no author username available');
    return {
      result: null,
      temporarilyUnavailable: false,
      notFound: true
    };
  }

  const accessKey = process.env.SOCIALKIT_ACCESS_KEY;
  if (!accessKey) {
    return {
      result: null,
      temporarilyUnavailable: false,
      notFound: true
    };
  }

  const profileUrl = 'https://www.instagram.com/' + encodeURIComponent(username) + '/';
  let cursor = null;
  let providerUnavailable = false;

  for (let page = 1; page <= 5; page += 1) {
    const endpoint = new URL('https://api.socialkit.dev/instagram/channel-posts');
    endpoint.searchParams.set('url', profileUrl);
    endpoint.searchParams.set('limit', '20');
    if (cursor) endpoint.searchParams.set('cursor', cursor);

    const response = await requestProviderJson(
      endpoint.toString(),
      {
        method: 'GET',
        headers: { 'x-access-key': accessKey }
      },
      'fetchFromSocialKitChannelPosts'
    );

    if (!response.json?.success) {
      providerUnavailable = response.temporarilyUnavailable ||
        (response.status >= 500) ||
        response.status === 429;

      console.log('[fetchFromSocialKitChannelPosts] failed to retrieve profile page', page);
      return {
        result: null,
        temporarilyUnavailable: providerUnavailable,
        providerError: true,
        retryAfterSeconds: response.retryAfterSeconds || null,
        notFound: false
      };
    }

    const data = response.json.data || {};
    const posts = Array.isArray(data.items) ? data.items : [];
    const target = posts.find((post) => {
      if (post?.shortcode === shortcode) return true;
      if (typeof post?.url !== 'string') return false;
      return extractShortcode(post.url) === shortcode;
    });

    if (target) {
      const items = buildCarouselImageItems(target);
      console.log('[fetchFromSocialKitChannelPosts] matching post found; available image slides:', items.length);

      if (items.length > 0) {
        const author = sanitizeUsername(target.author?.username || username);
        return {
          result: { username: author, items },
          temporarilyUnavailable: false,
          partial: items.length < collectionExpectedCount(target)
        };
      }

      return {
        result: null,
        temporarilyUnavailable: false,
        noAvailableImages: true
      };
    }

    if (data.hasMore !== true || !data.cursor) break;
    cursor = data.cursor;
  }

  return {
    result: null,
    temporarilyUnavailable: providerUnavailable,
    notFound: !providerUnavailable
  };
}

function collectionExpectedCount(post) {
  const collection = post?.imageCollection;
  if (Array.isArray(collection)) {
    return collection.length;
  }
  if (Array.isArray(collection?.items)) {
    return collection.items.length;
  }
  if (Array.isArray(collection?.images)) {
    return collection.images.length;
  }
  return 0;
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
    let providerError = downloadResponse.providerError === true;
    let retryAfterSeconds = downloadResponse.retryAfterSeconds || null;
    let unsupportedCarousel = false;
    let mediaWarning = null;
    let statsResponse = null;

    // A successful download response may contain the media URL but omit the
    // creator username. Resolve the name from post metadata before using the
    // generic filename fallback.
    if (result && !result.username) {
      statsResponse = await fetchFromSocialKitStats(url);
      const resolvedUsername = statsResponse.username || statsResponse.result?.username || null;

      if (resolvedUsername) {
        result = { ...result, username: resolvedUsername };
      }
    }

    if (!result) {
      statsResponse = statsResponse || await fetchFromSocialKitStats(url);
      result = statsResponse.result;
      providerUnavailable = providerUnavailable || statsResponse.temporarilyUnavailable;
      providerError = providerError || statsResponse.providerError === true;
      retryAfterSeconds = retryAfterSeconds || statsResponse.retryAfterSeconds || null;
      unsupportedCarousel = statsResponse.unsupportedCarousel === true;

      if (unsupportedCarousel) {
        const carouselResponse = await fetchCarouselFromSocialKit(
          statsResponse.username,
          shortcode
        );
        result = carouselResponse.result;
        providerUnavailable = providerUnavailable || carouselResponse.temporarilyUnavailable;
        providerError = providerError || carouselResponse.providerError === true;
        if (carouselResponse.partial) {
          mediaWarning = 'Some carousel images are unavailable. The displayed files are all images currently provided by Instagram.';
        }

        if (carouselResponse.noAvailableImages) {
          return res.status(422).json({
            error: 'Instagram found this carousel, but no downloadable image slides are currently available. Please try again later.'
          });
        }

        if (carouselResponse.notFound && !providerUnavailable) {
          console.log('[handler] carousel post was not found within the first 100 profile posts');
        }
      }
    }

    if (!result || !result.items || result.items.length === 0) {
      if (unsupportedCarousel && !providerUnavailable) {
        return res.status(422).json({
          error: 'Could not retrieve the carousel slides. The post may be older than the latest 100 profile posts, or Instagram did not provide its slide images.'
        });
      }

      if (providerUnavailable) {
        if (retryAfterSeconds && retryAfterSeconds > 0) {
          res.setHeader('Retry-After', String(Math.ceil(retryAfterSeconds)));
        }
        return res.status(503).json({
          error: 'Instagram could not extract this media right now. This does not mean the public post is missing. Please try again later.',
          code: 'instagram_temporarily_unavailable'
        });
      }

      if (providerError) {
        return res.status(502).json({
          error: 'The media provider could not verify or extract this post. The link may still be public and available. Please retry later.',
          code: 'instagram_provider_error'
        });
      }

      return res.status(502).json({
        error: 'Instagram returned no usable media data. The post was not confirmed as missing or private.',
        code: 'instagram_unverified_response'
      });
    }

    const baseName =
      result.username ||
      extractUsernameFromUrl(url) ||
      'instagram-' + shortcode;
    console.log('[handler] final baseName used for filename:', baseName);
    const isCarousel = result.items.length > 1;
    const items = result.items.map((item, index) => {
      const slideNumber = item.position || index + 1;
      return {
        ...item,
        filename: isCarousel
          ? baseName + '-' + String(slideNumber).padStart(2, '0')
          : baseName
      };
    });

    return res.status(200).json({
      items,
      ...(isCarousel ? { message: 'Available carousel image slides were found.' } : {}),
      ...(mediaWarning ? { warning: mediaWarning } : {})
    });
  } catch (err) {
    console.log('[handler] error:', err.message);
    return res.status(500).json({ error: 'Something went wrong while fetching the data' });
  }
}