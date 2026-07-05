import { useState } from 'react';

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
    <div className="container">
      <h1>Instagram Downloader</h1>
      <p className="subtitle">Masukkan link post, reel, atau IGTV yang bersifat publik</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="https://www.instagram.com/p/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Memproses...' : 'Download'}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {items && (
        <div className="result">
          {items.map((item, index) => (
            <div className="item" key={index}>
              {item.type === 'video' ? (
                <video src={item.mediaUrl} controls />
              ) : (
                <img src={item.mediaUrl} alt="Preview" />
              )}
              <a href={`/api/proxy?url=${encodeURIComponent(item.mediaUrl)}`}>
                Simpan File {items.length > 1 ? index + 1 : ''}
              </a>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 480px;
          margin: 60px auto;
          padding: 24px;
          font-family: Arial, sans-serif;
          text-align: center;
        }
        h1 {
          font-size: 24px;
          margin-bottom: 4px;
        }
        .subtitle {
          color: #666;
          font-size: 14px;
          margin-bottom: 24px;
        }
        form {
          display: flex;
          gap: 8px;
        }
        input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 14px;
        }
        button {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          background: #000;
          color: #fff;
          cursor: pointer;
          font-size: 14px;
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
        .error {
          color: #c00;
          margin-top: 16px;
          font-size: 14px;
        }
        .result {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .item video,
        .item img {
          width: 100%;
          border-radius: 8px;
          margin-bottom: 12px;
        }
        .item a {
          display: inline-block;
          padding: 10px 16px;
          background: #000;
          color: #fff;
          border-radius: 6px;
          text-decoration: none;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
}
