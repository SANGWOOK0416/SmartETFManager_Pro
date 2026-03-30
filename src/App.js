import React, { useState, useEffect } from 'react';
import EtfCard from './components/EtfCard';
import PortfolioChart from './components/PortfolioChart';
import TrendChart from './components/TrendChart';
import './App.css';

// 💡 1. 인기 ETF 목록 데이터 (API 호출 0회를 위한 로컬 데이터 배열)
// 미국 주요 ETF 14개를 미리 정의해 둡니다. 언제든 원하는 종목을 더 추가할 수 있습니다!
const POPULAR_ETFS = [
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF' },
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust (Nasdaq 100)' },
  { symbol: 'TQQQ', name: 'ProShares UltraPro QQQ (3x Leverage)' },
  { symbol: 'SQQQ', name: 'ProShares UltraPro Short QQQ (-3x Leverage)' },
  { symbol: 'JEPI', name: 'JPMorgan Equity Premium Income ETF' },
  { symbol: 'SCHD', name: 'Schwab US Dividend Equity ETF' },
  { symbol: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
  { symbol: 'SOXX', name: 'iShares Semiconductor ETF' },
  { symbol: 'SOXL', name: 'Direxion Daily Semiconductor Bull 3x Shares' },
  { symbol: 'ARKK', name: 'ARK Innovation ETF' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
];

const DIVIDEND_DATA = {
  'VOO': 6.50, 'QQQ': 3.50, 'JEPI': 4.50, 'TQQQ': 0.50, 'SCHD': 2.80, 'SPY': 6.60
};

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('VOO');
  
  const API_KEY = 'd6qd2f1r01qhcrmjoec0d6qd2f1r01qhcrmjoecg'; 

  const [watchList, setWatchList] = useState(['VOO', 'QQQ', 'JEPI', 'TQQQ']);
  const [myPortfolio, setMyPortfolio] = useState([]); 

  const [newSymbol, setNewSymbol] = useState('');
  const [newQuantity, setNewQuantity] = useState('');

  // 🌟 [추가됨] 자동완성 드롭다운을 위한 상태 변수
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/portfolio');
        const data = await response.json();
        const formattedData = data.map(item => ({
          ...item,
          quantity: parseFloat(item.quantity)
        }));
        setMyPortfolio(formattedData);
      } catch (error) {
        console.error('❌ DB 불러오기 에러:', error);
      }
    };
    fetchPortfolio();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const updateDB = async (symbol, finalQuantity) => {
    try {
      await fetch('http://localhost:5000/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol, quantity: finalQuantity }),
      });
    } catch (error) {
      console.error('❌ DB 업데이트 실패:', error);
    }
  };

  // 🌟 [추가됨] 검색어 입력 시 로컬 데이터에서 필터링하는 함수
  const handleSymbolChange = (e) => {
    const value = e.target.value.toUpperCase();
    setNewSymbol(value);

    if (value.length > 0) {
      // 입력한 글자가 symbol(티커)이나 name(이름)에 포함된 ETF만 걸러냅니다.
      const filtered = POPULAR_ETFS.filter(etf =>
        etf.symbol.includes(value) || etf.name.toUpperCase().includes(value)
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // 🌟 [추가됨] 추천 목록에서 항목을 클릭했을 때 실행되는 함수
  const handleSuggestionClick = (symbol) => {
    setNewSymbol(symbol);
    setShowSuggestions(false); // 선택 후 드롭다운 목록 숨기기
  };

  const handleTransaction = (type) => {
    if (!newSymbol || !newQuantity) return alert("종목명과 수량을 모두 입력해주세요!");
    const symbol = newSymbol.toUpperCase();
    const quantity = parseFloat(newQuantity);
    
    if (quantity <= 0) return alert("수량은 0보다 커야 합니다!");

    if (type === 'BUY' && !watchList.includes(symbol)) {
      setWatchList(prev => [...prev, symbol]);
    }

    setMyPortfolio(prev => {
      const existing = prev.find(item => item.symbol === symbol);
      let finalQuantity = 0;

      if (type === 'BUY') {
        finalQuantity = existing ? existing.quantity + quantity : quantity;
        updateDB(symbol, finalQuantity); 
        
        if (existing) {
          return prev.map(item => item.symbol === symbol ? { ...item, quantity: finalQuantity } : item);
        }
        return [...prev, { symbol, quantity: finalQuantity }];
      } 
      else if (type === 'SELL') {
        if (!existing) {
          alert(`보유하지 않은 종목(${symbol})은 매도할 수 없습니다.`);
          return prev;
        }
        if (existing.quantity < quantity) {
          alert(`잔고가 부족합니다. (현재 보유: ${existing.quantity}주)`);
          return prev;
        }
        
        finalQuantity = existing.quantity - quantity;
        updateDB(symbol, finalQuantity); 
        
        if (finalQuantity === 0) {
          return prev.filter(item => item.symbol !== symbol);
        }
        return prev.map(item => item.symbol === symbol ? { ...item, quantity: finalQuantity } : item);
      }
      return prev;
    });

    setNewSymbol('');
    setNewQuantity('');
  };

  const handleForceDelete = (targetSymbol) => {
    setWatchList(prev => prev.filter(s => s !== targetSymbol));
    setMyPortfolio(prev => prev.filter(item => item.symbol !== targetSymbol));
    updateDB(targetSymbol, 0); 
    if (selectedSymbol === targetSymbol) setSelectedSymbol('VOO');
  };

  const calculateDividend = () => {
    let preTax = 0;
    myPortfolio.forEach(item => {
      const dps = DIVIDEND_DATA[item.symbol] || 0; 
      preTax += dps * item.quantity;
    });
    const afterTax = preTax * 0.85; 
    return { preTax, afterTax };
  };

  const { preTax, afterTax } = calculateDividend();

  return (
    <div className="App" style={{ textAlign: 'center', padding: '20px', minHeight: '100vh' }}>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={toggleTheme} style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', backgroundColor: isDarkMode ? '#333' : '#ddd', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}>
          {isDarkMode ? '🌙 Dark' : '☀️ Light'}
        </button>
      </div>

      <h1>📊 Smart ETF Portfolio Visualizer</h1>
      <p style={{ color: 'var(--text-secondary)' }}>실시간 US ETF 대시보드</p>
      <hr style={{ borderColor: 'var(--card-border)', marginBottom: '20px' }}/>
      
      {/* 🛒 매수/매도 입력창 (자동완성 UI 적용) */}
      <div style={{
        backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '8px', padding: '20px', margin: '0 auto 20px auto', maxWidth: '800px',
        display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap',
        position: 'relative' // 자식인 드롭다운이 절대 위치를 가질 수 있도록 기준점 설정
      }}>
        
        {/* 🔍 검색창 영역 (상대 위치) */}
        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            placeholder="종목 (예: VOO)" 
            value={newSymbol} 
            onChange={handleSymbolChange} 
            onFocus={() => { if(newSymbol.length > 0) setShowSuggestions(true) }} 
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // 클릭 이벤트를 놓치지 않도록 0.2초 지연 후 숨김
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', width: '130px', fontWeight: 'bold' }} 
          />
          
          {/* 🌟 드롭다운 목록 UI */}
          {showSuggestions && suggestions.length > 0 && (
            <ul style={{
              position: 'absolute', top: '100%', left: 0, width: '250px',
              backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
              borderRadius: '4px', listStyle: 'none', padding: 0, margin: '5px 0 0 0',
              maxHeight: '200px', overflowY: 'auto', zIndex: 10, textAlign: 'left',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              {suggestions.map((etf) => (
                <li 
                  key={etf.symbol} 
                  onClick={() => handleSuggestionClick(etf.symbol)}
                  style={{
                    padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--card-border)',
                    color: 'var(--text-primary)', fontSize: '0.9rem'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#555'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <strong>{etf.symbol}</strong> <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>- {etf.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <input type="number" placeholder="수량" value={newQuantity} onChange={(e) => setNewQuantity(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid var(--card-border)', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', outline: 'none', width: '100px' }} />
        
        <button onClick={() => handleTransaction('BUY')} style={{ padding: '10px 20px', fontWeight: 'bold', color: '#fff', backgroundColor: '#c84a31', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          매수
        </button>
        <button onClick={() => handleTransaction('SELL')} style={{ padding: '10px 20px', fontWeight: 'bold', color: '#fff', backgroundColor: '#3498db', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          매도
        </button>
      </div>

      <div style={{
        backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '8px', padding: '20px', margin: '0 auto 20px auto', maxWidth: '800px',
        textAlign: 'left'
      }}>
        <h3 style={{ marginTop: 0, color: 'var(--text-primary)' }}>💵 예상 연간 배당금</h3>
        <p style={{ fontSize: '1.2rem', margin: '10px 0', color: 'var(--text-primary)' }}>
          세전 총액: <strong>${preTax.toFixed(2)}</strong>
        </p>
        <p style={{ fontSize: '1.5rem', color: '#2ecc71', margin: '10px 0' }}>
          세후 수령액 (15% 공제): <strong>${afterTax.toFixed(2)}</strong>
        </p>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '15px' }}>
          * VOO, QQQ, JEPI, TQQQ 등 주요 종목의 예상 데이터를 기반으로 계산되었습니다.
        </p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
        <h3 style={{ color: 'var(--text-primary)' }}>📈 관심 종목 리스트</h3>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
          {watchList.map(symbol => (
            <EtfCard 
              key={symbol} 
              symbol={symbol} 
              apiKey={API_KEY} 
              onDelete={() => handleForceDelete(symbol)}
              isSelected={selectedSymbol === symbol}
              onClick={() => setSelectedSymbol(symbol)}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>💼 내 지갑 (포트폴리오)</h3>
            <PortfolioChart portfolio={myPortfolio} />
          </div>
          <div style={{ flex: '1 1 400px' }}>
            <h3 style={{ color: 'var(--text-primary)' }}>📊 {selectedSymbol} 트렌드</h3>
            <TrendChart symbol={selectedSymbol} apiKey={API_KEY} />
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;