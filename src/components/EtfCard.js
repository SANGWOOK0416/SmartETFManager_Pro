import React, { useState, useEffect } from 'react';

const EtfCard = ({ symbol, apiKey, onDelete, isSelected, onClick }) => {
  const [data, setData] = useState({ price: 0, change: 0, percentChange: 0 });
  const [loading, setLoading] = useState(true);

  // Finnhub API를 통해 실시간 주가 데이터를 가져오는 부분
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`);
        const json = await res.json();
        setData({
          price: json.c, // 현재가
          change: json.d, // 변화량
          percentChange: json.dp // 변화율(%)
        });
        setLoading(false);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", symbol, error);
        setLoading(false);
      }
    };
    
    fetchQuote();
  }, [symbol, apiKey]);

  if (loading) {
    return (
      <div style={{ minWidth: '150px', padding: '15px', border: '1px solid var(--card-border)', borderRadius: '8px', backgroundColor: 'var(--card-bg)', color: 'var(--text-primary)' }}>
        로딩중...
      </div>
    );
  }

  // 한국 주식 스타일 적용: 상승 시 빨간색, 하락 시 파란색
  const isPositive = data.change > 0;
  const isNegative = data.change < 0;
  const color = isPositive ? '#e74c3c' : isNegative ? '#3498db' : 'var(--text-primary)';

  return (
    <div 
      onClick={onClick} // 💡 카드를 클릭하면 App.js의 setSelectedSymbol이 실행됨!
      style={{
        minWidth: '150px',
        padding: '15px',
        borderRadius: '8px',
        cursor: 'pointer',
        backgroundColor: 'var(--card-bg)',
        position: 'relative', // ✕ 버튼의 절대 위치 기준점
        // 💡 isSelected가 true면 파란색 테두리와 그림자 효과, 아니면 기본 테두리
        border: isSelected ? '2px solid #3498db' : '1px solid var(--card-border)',
        boxShadow: isSelected ? '0 0 10px rgba(52, 152, 219, 0.3)' : 'none',
        transition: 'all 0.2s ease',
        textAlign: 'center'
      }}
    >
      {/* 🗑️ 삭제 버튼 */}
      <button 
        onClick={(e) => {
          e.stopPropagation(); // 💡 아주 중요! 삭제 버튼을 눌렀을 때 카드가 클릭되는 것(onClick)을 막아줌
          onDelete();
        }} 
        style={{ 
          position: 'absolute', top: '5px', right: '8px', 
          background: 'none', border: 'none', cursor: 'pointer', 
          color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '1rem'
        }}
      >
        ✕
      </button>

      {/* 📊 종목 정보 표시 */}
      <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-primary)' }}>{symbol}</h3>
      <p style={{ fontSize: '1.5rem', margin: '0 0 5px 0', fontWeight: 'bold', color: 'var(--text-primary)' }}>
        ${data.price?.toFixed(2)}
      </p>
      <p style={{ margin: 0, fontWeight: 'bold', color: color }}>
        {data.change > 0 ? '+' : ''}{data.change?.toFixed(2)} ({data.percentChange?.toFixed(2)}%)
      </p>
    </div>
  );
};

export default EtfCard;