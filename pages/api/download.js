const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

function extractShortcode(url) {
  const match = url.match(/instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9-_]+)/);
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

  return items.length > 0 ? items : null;
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

  return [{ type: 'video', mediaUrl: json.data.downloadUrl }];
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

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    return null;
  }

  const media = json?.data?.xdt_shortcode_media;
  if (!media) return null;

  return buildMediaList(media);
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

  if (item.product_type === 'carousel_container' && item.carousel_media) {
    return item.carousel_media
      .map((m) => {
        if (m.video_versions && m.video_versions.length > 0) {
          return { type: 'video', mediaUrl: m.video_versions[0].url };
        }
        const best = m.image_versions2 && m.image_versions2.candidates && m.image_versions2.candidates[0];
        return best ? { type: 'image', mediaUrl: best.url } : null;
      })
      .filter(Boolean);
  }

  if (item.video_versions && item.video_versions.length > 0) {
    return [{ type: 'video', mediaUrl: item.video_versions[0].url }];
  }

  const best = item.image_versions2 && item.image_versions2.candidates && item.image_versions2.candidates[0];
  return best ? [{ type: 'image', mediaUrl: best.url }] : null;
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
  console.log('[handler] rapidapi key set:', Boolean(process.env.RAPIDAPI_KEY));
  console.log('[handler] socialkit key set:', Boolean(process.env.SOCIALKIT_ACCESS_KEY));
  console.log('[handler] sessionid set:', Boolean(process.env.INSTAGRAM_SESSIONID));

  try {
    let items = await fetchFromRapidApi(shortcode);

    if (!items || items.length === 0) {
      items = await fetchFromSocialKit(url);
    }

    if (!items || items.length === 0) {
      items = await fetchFromGraphql(shortcode);
    }

    if (!items || items.length === 0) {
      items = await fetchFromMagicParams(shortcode);
    }

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
