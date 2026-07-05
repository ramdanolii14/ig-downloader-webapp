function baseHeaders() {
  return {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9'
  };
}

function extractShortcode(url) {
  const match = url.match(/instagram\.com\/(?:p|reel|tv|reels)\/([^/?#&]+)/);
  return match ? match[1] : null;
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

function getSetCookies(response) {
  if (typeof response.headers.getSetCookie === 'function') {
    return response.headers.getSetCookie();
  }
  const single = response.headers.get('set-cookie');
  return single ? [single] : [];
}

async function getCsrfToken() {
  const response = await fetch('https://www.instagram.com/', { headers: baseHeaders() });
  const cookies = getSetCookies(response);
  const csrfCookie = cookies.find((c) => c.startsWith('csrftoken='));

  console.log('[getCsrfToken] status:', response.status, 'cookies found:', cookies.length);

  if (!csrfCookie) return null;
  return csrfCookie.split(';')[0].replace('csrftoken=', '');
}

async function fetchFromGraphql(shortcode) {
  const csrfToken = await getCsrfToken();

  if (!csrfToken) {
    console.log('[fetchFromGraphql] failed to obtain csrf token');
    return null;
  }

  const cookieParts = [`csrftoken=${csrfToken}`];
  if (process.env.INSTAGRAM_SESSIONID) {
    cookieParts.push(`sessionid=${process.env.INSTAGRAM_SESSIONID}`);
  }

  const body = new URLSearchParams({
    variables: JSON.stringify({
      shortcode,
      fetch_tagged_user_count: null,
      hoisted_comment_id: null,
      hoisted_reply_id: null
    }),
    doc_id: '9510064595728286'
  });

  const response = await fetch('https://www.instagram.com/graphql/query', {
    method: 'POST',
    headers: {
      ...baseHeaders(),
      'X-CSRFToken': csrfToken,
      'X-IG-App-ID': '936619743392459',
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookieParts.join('; ')
    },
    body: body.toString()
  });

  const text = await response.text();
  console.log('[fetchFromGraphql] status:', response.status);
  console.log('[fetchFromGraphql] body preview:', text.slice(0, 300));

  if (!response.ok) return null;

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.log('[fetchFromGraphql] response is not JSON');
    return null;
  }

  const media = json?.data?.xdt_shortcode_media;

  if (!media) {
    console.log('[fetchFromGraphql] no xdt_shortcode_media in response');
    return null;
  }

  return buildMediaList(media);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body || {};

  if (!url || !url.includes('instagram.com')) {
    return res.status(400).json({ error: 'URL Instagram tidak valid' });
  }

  const shortcode = extractShortcode(url);

  if (!shortcode) {
    return res.status(400).json({ error: 'Format URL tidak dikenali' });
  }

  console.log('[handler] shortcode:', shortcode);
  console.log('[handler] sessionid set:', Boolean(process.env.INSTAGRAM_SESSIONID));

  try {
    const items = await fetchFromGraphql(shortcode);

    if (!items || items.length === 0) {
      return res.status(404).json({
        error: 'Media tidak ditemukan. Cek log terminal untuk detail penyebabnya'
      });
    }

    return res.status(200).json({ items });
  } catch (err) {
    console.log('[handler] error:', err.message);
    return res.status(500).json({ error: 'Terjadi kesalahan saat mengambil data' });
  }
}