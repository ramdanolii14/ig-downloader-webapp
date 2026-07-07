export const config = {
  runtime: 'edge'
};

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9_.() -]/g, '').slice(0, 80) || 'instagram';
}

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');
  const requestedName = searchParams.get('filename');

  if (!url) {
    return new Response('Missing url', { status: 400 });
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

    const baseName = requestedName ? sanitizeFilename(requestedName) : 'instagram-media';
    const filename = `${baseName}.${extension}`;

    return new Response(response.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err) {
    return new Response('Failed to process media', { status: 500 });
  }
}
