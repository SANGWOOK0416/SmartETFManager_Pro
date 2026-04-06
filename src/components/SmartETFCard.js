import React from 'react';

// 💡 리스크 점수(1~10)와 섹터(Sector) 정보 추가
export const ETF_ANALYSIS_DB = {
  'VOO': { tag: '🔥 시장대표', color: '#e74c3c', risk: 5, sector: 'Index', desc: '미국 S&P 500 우량주' },
  'SPY': { tag: '🔥 시장대표', color: '#e74c3c', risk: 5, sector: 'Index', desc: '미국 S&P 500 우량주' },
  'QQQ': { tag: '🚀 성장형', color: '#3498db', risk: 7, sector: 'Technology', desc: '나스닥 대형 기술주' },
  'SCHD': { tag: '💰 가치/배당', color: '#f1c40f', risk: 4, sector: 'Dividend', desc: '꾸준한 배당성장주' },
  'JEPI': { tag: '💰 고배당', color: '#f1c40f', risk: 4, sector: 'Dividend', desc: '월배당 인컴형' },
  'TQQQ': { tag: '⚠️ 레버리지', color: '#9b59b6', risk: 10, sector: 'Technology', desc: '나스닥 3배 레버리지' },
  'SOXX': { tag: '💻 반도체', color: '#2980b9', risk: 8, sector: 'Technology', desc: '반도체 산업 집중' },
  'TLT':  { tag: '🛡️ 채권', color: '#2ecc71', risk: 2, sector: 'Bond', desc: '안전 자산 미국 국채' },
};

const SmartETFCard = ({ symbol, onDelete, isSelected, onClick }) => {
  // DB에 없는 종목을 검색했을 때의 기본값 처리
  const analysis = ETF_ANALYSIS_DB[symbol] || { tag: '📊 혼합/기타', color: '#95a5a6', desc: '일반 테마 ETF' };

  return (
    <div 
      onClick={onClick}
      style={{
        minWidth: '160px',
        padding: '15px',
        borderRadius: '12px',
        backgroundColor: isSelected ? 'var(--bg-color)' : 'var(--card-bg)',
        border: `2px solid ${isSelected ? analysis.color : 'var(--card-border)'}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.2s ease',
        boxShadow: isSelected ? `0 0 10px ${analysis.color}40` : 'none',
        textAlign: 'left'
      }}
    >
      {/* 종목명과 삭제 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{symbol}</h3>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          style={{ 
            background: 'none', border: 'none', color: '#e74c3c', 
            cursor: 'pointer', fontSize: '1.2rem', fontWeight: 'bold' 
          }}
        >
          ×
        </button>
      </div>

      {/* 💡 추가된 분석 태그 UI */}
      <div style={{ marginTop: '10px' }}>
        <span style={{
          backgroundColor: analysis.color,
          color: '#fff',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          display: 'inline-block',
          marginBottom: '5px'
        }}>
          {analysis.tag}
        </span>
        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          {analysis.desc}
        </p>
      </div>
    </div>
  );
};

export default SmartETFCard;