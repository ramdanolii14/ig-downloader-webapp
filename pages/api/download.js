const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

// --- Rate limiting -----------------------------------------------------
// In-memory per-IP limiter. This protects a single running Node process
// (e.g. `npm run dev`, or one VPS/PM2 instance) from spam clicks and
// scripted abuse hitting the paid RapidAPI/SocialKit quota. It does NOT
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

function buildMediaList(media) {
  if (!media) return [];

  if (media.edge_sidecar_to_children) {
    return media.edge_sidecar_to_children.edges.map((edge) => {
      const node = edge.node;
      return node.is_video
        ? { type: 'video', mediaUrl: node.video_url }
        : { type: 'image', mediaUrl: node.display_url };
    });
  }

  return [
    media.is_video
      ? { type: 'video', mediaUrl: media.video_url }
      : { type: 'image', mediaUrl: media.display_url }
  ];
}

async function fetchFromRapidApi(shortcode) {
  if (!process.env.RAPIDAPI_KEY) {
    console.log('[fetchFromRapidApi] skipped, no key set');
    return null;
  }

  const response = await fetch('https://instagram120.p.rapidapi.com/api/instagram/mediaByShortcode', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-rapidapi-host': 'instagram120.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY
    },
    body: JSON.stringify({ shortcode })
  });

  const text = await response.text();
  console.log('[fetchFromRapidApi] status:', response.status);
  console.log('[fetchFromRapidApi] body preview:', text.slice(0, 300));

  if (!response.ok) return null;

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }

  if (!Array.isArray(json) || json.length === 0) return null;

  const items = json
    .map((item) => {
      const media = item.urls && item.urls[0];
      if (!media || !media.url) return null;
      const isVideo = media.extension === 'mp4';
      return { type: isVideo ? 'video' : 'image', mediaUrl: media.url };
    })
    .filter(Boolean);

  if (items.length === 0) return null;

  const first = json[0] || {};
  console.log('[fetchFromRapidApi] first item keys:', Object.keys(first));
  console.log('[fetchFromRapidApi] meta field:', JSON.stringify(first.meta));
  const username = sanitizeUsername(
    first.owner?.username ||
      first.username ||
      first.author?.username ||
      first.meta?.username ||
      first.meta?.owner?.username ||
      first.meta?.author?.username ||
      first.meta?.user?.username ||
      first.meta?.uploader ||
      null
  );
  console.log('[fetchFromRapidApi] resolved username:', username);

  return { username, items };
}

async function fetchFromSocialKit(url) {
  if (!process.env.SOCIALKIT_ACCESS_KEY) {
    console.log('[fetchFromSocialKit] skipped, no access key set');
    return null;
  }

  const response = await fetch('https://api.socialkit.dev/instagram/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      access_key: process.env.SOCIALKIT_ACCESS_KEY,
      url,
      format: 'mp4',
      quality: '720p'
    })
  });

  const text = await response.text();
  console.log('[fetchFromSocialKit] status:', response.status);
  console.log('[fetchFromSocialKit] body preview:', text.slice(0, 300));

  if (!response.ok) return null;

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }

  if (!json.success || !json.data || !json.data.downloadUrl) return null;

  const username = sanitizeUsername(
    json.data.username || json.data.author?.username || json.data.uploader || null
  );

  return { username, items: [{ type: 'video', mediaUrl: json.data.downloadUrl }] };
}

async function fetchFromGraphql(shortcode) {
  const graphqlUrl = new URL('https://www.instagram.com/api/graphql');
  graphqlUrl.searchParams.set('variables', JSON.stringify({ shortcode }));
  graphqlUrl.searchParams.set('doc_id', '10015901848480474');
  graphqlUrl.searchParams.set('lsd', 'AVqbxe3J_YA');

  const headers = {
    'User-Agent': USER_AGENT,
    'Content-Type': 'application/x-www-form-urlencoded',
    'X-IG-App-ID': '936619743392459',
    'X-FB-LSD': 'AVqbxe3J_YA',
    'X-ASBD-ID': '129477',
    'Sec-Fetch-Site': 'same-origin'
  };

  if (process.env.INSTAGRAM_SESSIONID) {
    headers['Cookie'] = `sessionid=${process.env.INSTAGRAM_SESSIONID}`;
  }

  const response = await fetch(graphqlUrl.toString(), { method: 'POST', headers });
  const text = await response.text();

  console.log('[fetchFromGraphql] status:', response.status);
  console.log('[fetchFromGraphql] body preview:', text.slice(0, 300));

  if (!response.ok) return null;

  if (text.trim().startsWith('<')) {
    console.log('[fetchFromGraphql] got HTML instead of JSON — request was blocked/rejected by Instagram');
    return null;
  }

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }

  const media = json?.data?.xdt_shortcode_media;
  if (!media) return null;

  const items = buildMediaList(media);
  if (items.length === 0) return null;

  const username = sanitizeUsername(media.owner?.username);

  return { username, items };
}

async function fetchFromMagicParams(shortcode) {
  if (!process.env.INSTAGRAM_SESSIONID) {
    console.log('[fetchFromMagicParams] skipped, no sessionid set');
    return null;
  }

  const apiUrl = `https://www.instagram.com/p/${shortcode}?__a=1&__d=dis`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': USER_AGENT,
      'X-IG-App-ID': '936619743392459',
      'Sec-Fetch-Site': 'same-origin',
      Cookie: `sessionid=${process.env.INSTAGRAM_SESSIONID}`
    }
  });

  const text = await response.text();

  console.log('[fetchFromMagicParams] status:', response.status);
  console.log('[fetchFromMagicParams] body preview:', text.slice(0, 300));

  if (!response.ok) return null;

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }

  const item = json?.items?.[0];
  if (!item) return null;

  const username = sanitizeUsername(item.user?.username);

  if (item.product_type === 'carousel_container' && item.carousel_media) {
    const items = item.carousel_media
      .map((m) => {
        if (m.video_versions && m.video_versions.length > 0) {
          return { type: 'video', mediaUrl: m.video_versions[0].url };
        }
        const best = m.image_versions2 && m.image_versions2.candidates && m.image_versions2.candidates[0];
        return best ? { type: 'image', mediaUrl: best.url } : null;
      })
      .filter(Boolean);
    return items.length > 0 ? { username, items } : null;
  }

  if (item.video_versions && item.video_versions.length > 0) {
    return { username, items: [{ type: 'video', mediaUrl: item.video_versions[0].url }] };
  }

  const best = item.image_versions2 && item.image_versions2.candidates && item.image_versions2.candidates[0];
  return best ? { username, items: [{ type: 'image', mediaUrl: best.url }] } : null;
}

async function resolveUsernameFallback(shortcode) {
  console.log('[resolveUsernameFallback] trying graphql for shortcode:', shortcode);
  try {
    const graphqlResult = await fetchFromGraphql(shortcode);
    if (graphqlResult && graphqlResult.username) {
      console.log('[resolveUsernameFallback] got username from graphql:', graphqlResult.username);
      return graphqlResult.username;
    }
    console.log('[resolveUsernameFallback] graphql returned no username');
  } catch (err) {
    console.log('[resolveUsernameFallback] graphql error:', err.message);
  }

  console.log('[resolveUsernameFallback] trying magicParams for shortcode:', shortcode);
  try {
    const magicResult = await fetchFromMagicParams(shortcode);
    if (magicResult && magicResult.username) {
      console.log('[resolveUsernameFallback] got username from magicParams:', magicResult.username);
      return magicResult.username;
    }
    console.log('[resolveUsernameFallback] magicParams returned no username');
  } catch (err) {
    console.log('[resolveUsernameFallback] magicParams error:', err.message);
  }

  console.log('[resolveUsernameFallback] all sources failed, no username resolved');
  return null;
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

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'Invalid Instagram URL' });
  }

  const shortcode = extractShortcode(url);

  if (!shortcode) {
    return res.status(400).json({ error: 'Unrecognized URL format' });
  }

  console.log('[handler] shortcode:', shortcode);
  console.log('[handler] rapidapi key set:', Boolean(process.env.RAPIDAPI_KEY));
  console.log('[handler] socialkit key set:', Boolean(process.env.SOCIALKIT_ACCESS_KEY));
  console.log('[handler] sessionid set:', Boolean(process.env.INSTAGRAM_SESSIONID));

  try {
    let result = await fetchFromRapidApi(shortcode);

    if (!result || !result.items || result.items.length === 0) {
      result = await fetchFromSocialKit(url);
    }

    if (!result || !result.items || result.items.length === 0) {
      result = await fetchFromGraphql(shortcode);
    }

    if (!result || !result.items || result.items.length === 0) {
      result = await fetchFromMagicParams(shortcode);
    }

    if (!result || !result.items || result.items.length === 0) {
      return res.status(404).json({
        error: 'Media not found. Check the terminal log for details on why.'
      });
    }

    const baseName =
      result.username ||
      extractUsernameFromUrl(url) ||
      (await resolveUsernameFallback(shortcode)) ||
      'instagram';
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