export const config = {
  runtime: 'edge'
};

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

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
        'Content-Disposition': `attachment; filename="instagram-media.${extension}"`
      }
    });
  } catch (err) {
    return new Response('Gagal memproses media', { status: 500 });
  }
}
