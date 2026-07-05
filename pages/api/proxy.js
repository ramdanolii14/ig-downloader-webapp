export default async function handler(req, res) {
  const { url } = req.query;

  if (!url) {
    return res.status(400).send('URL tidak ada');
  }

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(400).send('Gagal mengambil media');
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const extension = contentType.includes('video') ? 'mp4' : 'jpg';
    const arrayBuffer = await response.arrayBuffer();

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="instagram-media.${extension}"`);
    res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    res.status(500).send('Gagal memproses media');
  }
}
