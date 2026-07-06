import { useState } from 'react';
import Head from 'next/head';

const FEATURES = [
  {
    tag: '[format]',
    title: 'All formats supported',
    body: 'Download photos, videos, reels, IGTV, and carousels from public Instagram posts. All content types are supported as long as the post is public.'
  },
  {
    tag: '[resolution]',
    title: 'Original resolution',
    body: 'Files are fetched directly from the source, so their size and quality match what was uploaded by the account owner.'
  },
  {
    tag: '[speed]',
    title: 'No waiting',
    body: 'The process runs on the server, not on your phone, so it doesn\'t drain your battery or use your data while waiting.'
  },
  {
    tag: '[account]',
    title: 'No Instagram login required',
    body: 'Just paste the public link. You don\'t need to enter your Instagram username or password.'
  },
  {
    tag: '[watermark]',
    title: 'No additional watermarks',
    body: 'The saved files are identical to the originals, without any logos or backlinks to any website.'
  },
  {
    tag: '[devices]',
    title: 'Works on phones and computers',
    body: 'This page is fully responsive, usable via the browser on smartphones, tablets, or laptops without installing any applications.'
  }
];

const STEPS = [
  {
    number: '01',
    title: 'Copy the public post link',
    body: 'Open the instagram app or website, find the public post you want to download, and copy its link.'
  },
  {
    number: '02',
    title: 'Paste in the input box',
    body: 'Return to this page, paste the link into the input box at the top of the page.'
  },
  {
    number: '03',
    title: 'Press the download button',
    body: 'The system will fetch the media data from the post and display a preview on the screen.'
  },
  {
    number: '04',
    title: 'Save each file',
    body: 'Click the save file option for each result to download them one by one to your device.'
  }
];

const FORMATS = ['Single Photo', 'Multi-Photo Carousel', 'Video Feed', 'Reels', 'IGTV', 'Public Profile Photo'];

const FAQS = [
  {
    q: 'Is this tool free to use?',
    a: 'Yes. This page does not charge any fees for downloading photos or videos from public Instagram posts.'
  },
  {
    q: 'Do I need to log in to my Instagram account?',
    a: 'No. You only need to paste the link of the public post. There are no username or password fields on this page.'
  },
  {
    q: 'Can I download from private accounts?',
    a: 'No. This tool only works for public posts, according to the privacy settings chosen by the account owner.'
  },
  {
    q: 'Why does the link I paste sometimes not work?',
    a: 'There are several possible reasons: the post has been deleted, the account has been changed to private, or the pasted link is incomplete.'
  },
  {
    q: 'Does the downloaded file have a watermark or additional logo?',
    a: 'No. The files you save are identical to those uploaded by the account owner, without any logos or watermarks.'
  },
  {
    q: 'Can I download multiple photos at once from a carousel?',
    a: 'Yes. If the post contains multiple photos or videos in a single carousel, all of them will be displayed and can be saved one by one.'
  },
  {
    q: 'Can this page be used on mobile devices?',
    a: 'Yes. The page layout automatically adjusts for mobile, tablet, and desktop browsers.'
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
        <title>Instagram Downloader - Save Photos, Videos, and Reels Instagram for Free</title>
        <meta
          name="description"
          content="Download photos, videos, reels, IGTV, and carousels from public Instagram posts for free. No login, no watermark, directly from your mobile or desktop browser."
        />
        <meta
          name="keywords"
          content="instagram downloader, download instagram photos, download instagram videos, download instagram reels, download igtv, free instagram downloader"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Instagram Downloader - Save Photos, Videos, and Reels Instagram" />
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
            INSTAGRAM DOWNLOADER
          </span>
          <nav className="topnav" aria-label="Navigasi halaman">
            <a href="#cara-pakai">How to Use</a>
            <a href="#fitur">Features</a>
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

          <p className="eyebrow">frame 001 / Download Public Media</p>
          <h1 id="hero-heading">save photos and videos from instagram for free</h1>
          <p className="hero-sub">
            Paste the link of a public instagram post and get the original media files in seconds. No login, no watermark, works on mobile and desktop browsers.
          </p>

          <form onSubmit={handleSubmit} className="download-form">
            <label htmlFor="ig-url" className="sr-only">
              Link
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
              {loading ? 'Downloading...' : 'Download'}
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
                  <a href={`/api/proxy?url=${encodeURIComponent(item.mediaUrl)}`}>Save File</a>
                </article>
              ))}
            </div>
          </section>
        )}

        <section className="how-to" id="cara-pakai" aria-labelledby="how-to-heading">
          <p className="eyebrow">frame 002 / guide</p>
          <h2 id="how-to-heading">How to Use This Tool</h2>
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
          <p className="eyebrow">frame 003 / benefits</p>
          <h2 id="features-heading">Why Use This Page</h2>
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
          <p className="eyebrow">frame 004 / content types</p>
          <h2 id="formats-heading">Supported Content Types</h2>
          <p className="formats-intro">
            As long as the post is public, this page can read and prepare files from
            the following types of instagram content.
          </p>
          <ul className="format-list">
            {FORMATS.map((format) => (
              <li key={format}>{format}</li>
            ))}
          </ul>
        </section>

        <section className="faq" id="faq" aria-labelledby="faq-heading">
          <p className="eyebrow">frame 005 / frequently asked questions</p>
          <h2 id="faq-heading">Frequently Asked Questions</h2>
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
            This is an independent third-party tool and is not affiliated with, sponsored by, or endorsed by Instagram or Meta Platforms Inc. All brand names are the property of their respective owners.
          </p>
          <p>
            Use this tool responsibly. Respect the copyright of content creators and do not redistribute downloaded material without permission from the original creators.
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
