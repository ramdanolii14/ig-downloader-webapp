export const config = {
  runtime: 'edge'
};

function sanitizeFilename(name) {
  if (!name || typeof name !== 'string') return null;
  const cleaned = name.trim().replace(/[\\/:*?"<>|]/g, '');
  return cleaned.length > 0 ? cleaned : null;
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const name = sanitizeFilename(searchParams.get('name')) || 'instagram-media';

  if (!url) {
    return new Response('URL tidak ada', { status: 400 });
  }

  try {
    const response = await fetch(url);

    if (!response.ok || !response.body) {
      return new Response('Gagal mengambil media', { status: 400 });
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
    return new Response('Gagal memproses media', { status: 500 });
  }
}