export const config = {
  runtime: 'edge'
};

function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return null;
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

// Best-effort per-IP limiter for the edge runtime. Note: edge instances can
// be spun up/torn down freely, so this Map isn't guaranteed to persist
// across every request the way a normal Node process would — it still
// blocks bursts within the same instance, which covers spam-clicking.
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 30; // proxy is hit once per file, so allow more than /api/download
const rateLimitStore = new Map();

function getClientIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown';
}

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(ip) || []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);
  return false;
}

export default async function handler(req) {
  const clientIp = getClientIp(req);

  if (isRateLimited(clientIp)) {
    return new Response('Too many requests, please try again shortly', { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const name = sanitizeFilename(searchParams.get('name')) || 'instagram-media';

  if (!url) {
    return new Response('No URL provided', { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok || !response.body) {
      return new Response('Failed to fetch media', { status: 400 });
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    let extension = 'jpg';
    if (contentType.includes('video')) extension = 'mp4';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('png')) extension = 'png';

    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${name}.${extension}"`
      }
    });
  } catch (err) {
    return new Response('Failed to process media', { status: 500 });
  }
}