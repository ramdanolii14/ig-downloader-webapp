import { useState } from 'react';
import Head from 'next/head';

const FEATURES = [
  {
    tag: '[format]',
    title: 'Semua jenis konten',
    body: 'Unduh foto tunggal, video, Reels, IGTV, dan carousel banyak slide dari satu kotak input yang sama.'
  },
  {
    tag: '[kualitas]',
    title: 'Resolusi asli',
    body: 'File diambil langsung dari sumbernya, jadi ukuran dan kualitasnya sama seperti yang diunggah pemilik akun.'
  },
  {
    tag: '[kecepatan]',
    title: 'Tanpa antre',
    body: 'Prosesnya jalan di server, bukan di HP kamu, jadi tidak membebani baterai atau kuota saat menunggu.'
  },
  {
    tag: '[akun]',
    title: 'Tanpa login instagram',
    body: 'Cukup tempel link publiknya. Tidak perlu memasukkan username atau kata sandi akun instagram kamu.'
  },
  {
    tag: '[tanda air]',
    title: 'Tanpa watermark tambahan',
    body: 'File yang tersimpan persis seperti aslinya, tidak ditempeli logo atau tautan balik ke situs manapun.'
  },
  {
    tag: '[perangkat]',
    title: 'Jalan di HP dan komputer',
    body: 'Halaman ini responsif penuh, dipakai lewat browser HP, tablet, atau laptop tanpa pasang aplikasi apapun.'
  }
];

const STEPS = [
  {
    number: '01',
    title: 'Salin link postingan',
    body: 'Buka instagram, cari postingan publik yang ingin disimpan, ketuk titik tiga lalu pilih salin link.'
  },
  {
    number: '02',
    title: 'Tempel di kotak input',
    body: 'Kembali ke halaman ini, tempel link tadi ke kotak input di bagian atas halaman.'
  },
  {
    number: '03',
    title: 'Tekan tombol unduh',
    body: 'Sistem akan mengambil data media dari postingan tersebut dan menampilkan pratinjaunya di layar.'
  },
  {
    number: '04',
    title: 'Simpan tiap file',
    body: 'Klik simpan file pada tiap hasil untuk mengunduhnya satu per satu ke perangkat kamu.'
  }
];

const FORMATS = ['Foto tunggal', 'Carousel banyak foto', 'Video feed', 'Reels', 'IGTV', 'Foto profil publik'];

const FAQS = [
  {
    q: 'Apakah alat ini gratis digunakan?',
    a: 'Ya. Halaman ini tidak memungut biaya apapun untuk mengunduh foto atau video dari postingan publik instagram.'
  },
  {
    q: 'Apakah saya perlu login ke akun instagram?',
    a: 'Tidak. Kamu hanya perlu menempelkan link postingan publik. Tidak ada kolom username atau kata sandi di halaman ini.'
  },
  {
    q: 'Apakah bisa mengunduh dari akun privat?',
    a: 'Tidak. Alat ini hanya bekerja untuk postingan yang bersifat publik, sesuai dengan pengaturan privasi yang dipilih pemilik akun.'
  },
  {
    q: 'Kenapa link yang saya tempel kadang tidak ditemukan?',
    a: 'Beberapa kemungkinan penyebabnya, postingan sudah dihapus, akun diubah menjadi privat, atau link yang ditempel tidak lengkap.'
  },
  {
    q: 'Apakah file yang diunduh ada tanda air atau logo tambahan?',
    a: 'Tidak. File yang kamu simpan persis sama seperti yang diunggah pemilik akun, tanpa logo atau watermark tambahan.'
  },
  {
    q: 'Bisakah mengunduh beberapa foto sekaligus dari satu carousel?',
    a: 'Bisa. Kalau postingan berisi beberapa foto atau video dalam satu carousel, semuanya akan ditampilkan dan bisa disimpan satu per satu.'
  },
  {
    q: 'Apakah halaman ini bisa dipakai lewat HP?',
    a: 'Bisa. Tampilan halaman ini menyesuaikan otomatis baik dibuka lewat HP, tablet, maupun komputer.'
  }
];

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setItems(null);
    setLoading(true);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan');
      } else {
        setItems(data.items);
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Instagram Downloader - Simpan Foto, Video, dan Reels Instagram Gratis</title>
        <meta
          name="description"
          content="Unduh foto, video, reels, IGTV, dan carousel dari postingan publik instagram secara gratis. Tanpa login, tanpa watermark, langsung dari browser HP atau komputer."
        />
        <meta
          name="keywords"
          content="instagram downloader, download foto instagram, download video instagram, download reels instagram, download igtv, unduh instagram gratis"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Instagram Downloader - Simpan Foto, Video, dan Reels Instagram" />
        <meta
          property="og:description"
          content="Tempel link postingan publik instagram, dapatkan file foto atau video aslinya dalam hitungan detik."
        />
        <meta property="og:type" content="website" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className="page">
        <header className="topbar">
          <span className="brand">
            <span className="brand-mark" aria-hidden="true" />
            IG SIMPAN
          </span>
          <nav className="topnav" aria-label="Navigasi halaman">
            <a href="#cara-pakai">Cara pakai</a>
            <a href="#fitur">Fitur</a>
            <a href="#faq">FAQ</a>
          </nav>
        </header>

        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-frame" aria-hidden="true">
            <span className="corner corner-tl" />
            <span className="corner corner-tr" />
            <span className="corner corner-bl" />
            <span className="corner corner-br" />
          </div>

          <p className="eyebrow">frame 001 / unduh media publik</p>
          <h1 id="hero-heading">Simpan foto dan video instagram dalam beberapa detik</h1>
          <p className="hero-sub">
            Tempel link postingan, reels, atau igtv publik di bawah ini. Sistem akan mengambil file
            aslinya langsung dari sumbernya, tanpa perlu login dan tanpa memasang aplikasi apapun.
          </p>

          <form onSubmit={handleSubmit} className="download-form">
            <label htmlFor="ig-url" className="sr-only">
              Link postingan instagram
            </label>
            <input
              id="ig-url"
              type="text"
              placeholder="https://www.instagram.com/p/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Memproses...' : 'Unduh sekarang'}
            </button>
          </form>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </section>

        {items && (
          <section className="results" aria-labelledby="results-heading">
            <h2 id="results-heading">
              Hasil ditemukan <span className="count-tag">{items.length} file</span>
            </h2>
            <div className="results-grid">
              {items.map((item, index) => (
                <article className="frame-card" key={index}>
                  <span className="frame-number">F{String(index + 1).padStart(2, '0')}</span>
                  {item.type === 'video' ? (
                    <video src={item.mediaUrl} controls />
                  ) : (
                    <img src={item.mediaUrl} alt={`Media instagram nomor ${index + 1}`} />
                  )}
                  <a href={`/api/proxy?url=${encodeURIComponent(item.mediaUrl)}`}>Simpan file</a>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="how-to" id="cara-pakai" aria-labelledby="how-to-heading">
          <p className="eyebrow">frame 002 / panduan</p>
          <h2 id="how-to-heading">Cara memakai alat ini</h2>
          <ol className="steps">
            {STEPS.map((step) => (
              <li className="step" key={step.number}>
                <span className="step-number">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="features" id="fitur" aria-labelledby="features-heading">
          <p className="eyebrow">frame 003 / kelebihan</p>
          <h2 id="features-heading">Kenapa memakai halaman ini</h2>
          <div className="feature-grid">
            {FEATURES.map((feature) => (
              <div className="feature-card" key={feature.title}>
                <span className="feature-tag">{feature.tag}</span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="formats" aria-labelledby="formats-heading">
          <p className="eyebrow">frame 004 / jenis konten</p>
          <h2 id="formats-heading">Jenis konten yang didukung</h2>
          <p className="formats-intro">
            Selama postingan bersifat publik, halaman ini bisa membaca dan menyiapkan file dari
            berbagai jenis konten instagram berikut.
          </p>
          <ul className="format-list">
            {FORMATS.map((format) => (
              <li key={format}>{format}</li>
            ))}
          </ul>
        </section>

        <section className="faq" id="faq" aria-labelledby="faq-heading">
          <p className="eyebrow">frame 005 / pertanyaan umum</p>
          <h2 id="faq-heading">Pertanyaan yang sering ditanyakan</h2>
          <div className="faq-list">
            {FAQS.map((item) => (
              <details className="faq-item" key={item.q}>
                <summary>{item.q}</summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <footer className="footer">
          <p>
            Halaman ini adalah alat pihak ketiga yang independen dan tidak berafiliasi, disponsori,
            atau didukung secara resmi oleh instagram maupun meta platforms inc. Semua nama merek
            adalah milik pemegang haknya masing masing.
          </p>
          <p>
            Gunakan alat ini sewajarnya. Hormati hak cipta pemilik konten dan jangan menyebarkan
            ulang materi yang diunduh tanpa izin dari pembuat aslinya.
          </p>
        </footer>
      </main>

      <style jsx>{`
        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          background: #efece4;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
        }

        .page {
          font-family: 'Inter', Arial, sans-serif;
          color: #1c1b18;
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px 64px;
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 28px 0;
          border-bottom: 1px solid rgba(28, 27, 24, 0.12);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          font-size: 18px;
          letter-spacing: 0.02em;
        }

        .brand-mark {
          width: 14px;
          height: 14px;
          background: #c1432e;
          border-radius: 3px;
          display: inline-block;
        }

        .topnav {
          display: flex;
          gap: 24px;
        }

        .topnav a {
          color: #1c1b18;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          border-bottom: 1px solid transparent;
        }

        .topnav a:hover,
        .topnav a:focus-visible {
          border-bottom-color: #c1432e;
        }

        .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b6a63;
          margin: 0 0 12px;
        }

        .hero {
          position: relative;
          padding: 56px 32px;
          margin-top: 32px;
          border: 1px solid rgba(28, 27, 24, 0.16);
          background: #f7f5ef;
        }

        .hero-frame .corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border: 2px solid #2f3b58;
        }

        .corner-tl {
          top: -1px;
          left: -1px;
          border-right: none;
          border-bottom: none;
        }
        .corner-tr {
          top: -1px;
          right: -1px;
          border-left: none;
          border-bottom: none;
        }
        .corner-bl {
          bottom: -1px;
          left: -1px;
          border-right: none;
          border-top: none;
        }
        .corner-br {
          bottom: -1px;
          right: -1px;
          border-left: none;
          border-top: none;
        }

        .hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.15;
          margin: 0 0 16px;
          max-width: 720px;
        }

        .hero-sub {
          font-size: 16px;
          line-height: 1.6;
          color: #3d3b35;
          max-width: 620px;
          margin: 0 0 32px;
        }

        .download-form {
          display: flex;
          gap: 10px;
          max-width: 620px;
          flex-wrap: wrap;
        }

        .download-form input {
          flex: 1 1 320px;
          padding: 14px 16px;
          border: 1px solid rgba(28, 27, 24, 0.28);
          background: #fff;
          font-size: 15px;
          font-family: inherit;
        }

        .download-form input:focus-visible {
          outline: 2px solid #2f3b58;
          outline-offset: 2px;
        }

        .download-form button {
          padding: 14px 22px;
          border: none;
          background: #c1432e;
          color: #fff;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
        }

        .download-form button:hover:not(:disabled) {
          background: #a63523;
        }

        .download-form button:focus-visible {
          outline: 2px solid #2f3b58;
          outline-offset: 2px;
        }

        .download-form button:disabled {
          opacity: 0.6;
          cursor: default;
        }

        .error {
          margin-top: 18px;
          color: #a63523;
          font-weight: 500;
        }

        .results {
          margin-top: 48px;
        }

        .results h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .count-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          background: #2f3b58;
          color: #fff;
          padding: 4px 8px;
          border-radius: 3px;
        }

        .results-grid {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .frame-card {
          position: relative;
          border: 1px solid rgba(28, 27, 24, 0.2);
          background: #fff;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .frame-number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: #6b6a63;
        }

        .frame-card img,
        .frame-card video {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          background: #eee;
        }

        .frame-card a {
          text-align: center;
          padding: 10px;
          background: #1c1b18;
          color: #fff;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .frame-card a:hover {
          background: #2f3b58;
        }

        section.how-to,
        section.features,
        section.formats,
        section.faq {
          margin-top: 72px;
        }

        .how-to h2,
        .features h2,
        .formats h2,
        .faq h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px;
          margin: 0 0 28px;
        }

        .steps {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(2, 1fr);
        }

        .step {
          display: flex;
          gap: 16px;
          border-top: 1px solid rgba(28, 27, 24, 0.16);
          padding-top: 16px;
        }

        .step-number {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 22px;
          color: #c1432e;
          font-weight: 500;
        }

        .step h3 {
          margin: 0 0 6px;
          font-size: 17px;
        }

        .step p {
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
          color: #3d3b35;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .feature-card {
          border: 1px solid rgba(28, 27, 24, 0.16);
          padding: 20px;
          background: #f7f5ef;
        }

        .feature-tag {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: #2f3b58;
        }

        .feature-card h3 {
          margin: 10px 0 8px;
          font-size: 16px;
        }

        .feature-card p {
          margin: 0;
          font-size: 14px;
          line-height: 1.55;
          color: #3d3b35;
        }

        .formats-intro {
          font-size: 15px;
          line-height: 1.6;
          color: #3d3b35;
          max-width: 640px;
          margin: 0 0 24px;
        }

        .format-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .format-list li {
          border: 1px solid rgba(28, 27, 24, 0.2);
          padding: 14px 16px;
          font-size: 14px;
          font-weight: 500;
          background: #fff;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .faq-item {
          border: 1px solid rgba(28, 27, 24, 0.18);
          background: #f7f5ef;
          padding: 14px 18px;
        }

        .faq-item summary {
          cursor: pointer;
          font-weight: 600;
          font-size: 15px;
        }

        .faq-item p {
          margin: 12px 0 2px;
          font-size: 14px;
          line-height: 1.6;
          color: #3d3b35;
        }

        .footer {
          margin-top: 72px;
          padding-top: 24px;
          border-top: 1px solid rgba(28, 27, 24, 0.16);
          font-size: 12px;
          line-height: 1.6;
          color: #6b6a63;
        }

        .footer p {
          margin: 0 0 8px;
        }

        @media (prefers-reduced-motion: reduce) {
          :global(html) {
            scroll-behavior: auto;
          }
        }

        @media (max-width: 780px) {
          .steps {
            grid-template-columns: 1fr;
          }
          .feature-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .format-list {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .topnav {
            display: none;
          }
          .hero {
            padding: 36px 20px;
          }
          .results-grid {
            grid-template-columns: 1fr;
          }
          .feature-grid {
            grid-template-columns: 1fr;
          }
          .format-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
