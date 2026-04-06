import React, { useState, useEffect } from 'react';

const NewsFeed = ({ symbol }) => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/news/${symbol}`);
        const data = await res.json();
        setNews(data);
      } catch (error) {
        console.error("뉴스 로드 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [symbol]);

  return (
    <div style={{ backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '12px', border: '1px solid var(--card-border)', textAlign: 'left', height: '100%' }}>
      <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>📰 {symbol} 최신 글로벌 뉴스</h3>
      
      {loading ? (
        <p style={{ color: '#888' }}>뉴스를 불러오는 중입니다...</p>
      ) : news.length === 0 ? (
        <p style={{ color: '#888' }}>관련 뉴스가 없습니다.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {news.map((item, index) => (
            <li key={index} style={{ marginBottom: '15px', borderBottom: index !== news.length - 1 ? '1px solid var(--card-border)' : 'none', paddingBottom: '10px' }}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', display: 'block', marginBottom: '5px' }}>
                {item.title}
              </a>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', backgroundColor: '#333', padding: '2px 6px', borderRadius: '4px' }}>
                {item.publisher}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsFeed;