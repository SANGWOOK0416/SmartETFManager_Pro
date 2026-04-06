import React, { useState, useEffect } from 'react';
import SmartETFCard from './components/SmartETFCard'; 
import PortfolioChart from './components/PortfolioChart'; 
import TrendChart from './components/TrendChart';
import NewsFeed from './components/NewsFeed';
import ComparisonChart from './components/ComparisonChart';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 📊 ETF 풀네임 및 배당률 통합 데이터
export const ETF_METADATA = {
  'VOO': { risk: 5, sector: 'Index', dividendYield: 0.015, fullName: 'Vanguard S&P 500 ETF' },
  'SPY': { risk: 5, sector: 'Index', dividendYield: 0.014, fullName: 'SPDR S&P 500 ETF Trust' },
  'QQQ': { risk: 7, sector: 'Tech', dividendYield: 0.006, fullName: 'Invesco QQQ Trust' },
  'SCHD': { risk: 4, sector: 'Div', dividendYield: 0.035, fullName: 'Schwab US Dividend Equity ETF' },
  'JEPI': { risk: 4, sector: 'Income', dividendYield: 0.075, fullName: 'JPMorgan Equity Premium Income' },
  'TQQQ': { risk: 10, sector: 'Leverage', dividendYield: 0.011, fullName: 'ProShares UltraPro QQQ' },
  'SOXX': { risk: 8, sector: 'Tech', dividendYield: 0.008, fullName: 'iShares Semiconductor ETF' },
  'TLT':  { risk: 2, sector: 'Bond', dividendYield: 0.038, fullName: 'iShares 20+ Year Treasury Bond' },
};

const getEnhancedInsight = (portfolio) => {
  if (!portfolio || portfolio.length === 0) return { text: "종목을 추가하여 분석을 시작하세요.", score: 0, profit: 0 };
  const totalValue = portfolio.reduce((acc, cur) => acc + (cur.quantity * cur.currentPrice), 0);
  const avgProfit = portfolio.reduce((acc, cur) => acc + (cur.profitRate || 0), 0) / portfolio.length;
  const totalRisk = portfolio.reduce((acc, cur) => {
    const risk = ETF_METADATA[cur.symbol]?.risk || 5;
    return acc + (risk * (cur.quantity * cur.currentPrice));
  }, 0) / totalValue;

  return {
    score: totalRisk.toFixed(1),
    text: totalRisk > 7 ? "고위험 성장형 🚀" : totalRisk < 4 ? "안전 지향형 🛡️" : "균형 잡힌 포트폴리오 ⚖️",
    profit: avgProfit.toFixed(2)
  };
};

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(() => JSON.parse(localStorage.getItem('theme')) ?? true);
  const [selectedSymbol, setSelectedSymbol] = useState(localStorage.getItem('lastSymbol') || 'VOO');
  
  // 💡 관심종목 배열 (기본값 세팅)
  const [watchList, setWatchList] = useState(['VOO', 'QQQ', 'JEPI', 'TQQQ']);
  const [myPortfolio, setMyPortfolio] = useState([]); 
  
  const [newSymbol, setNewSymbol] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const availableTickers = Object.keys(ETF_METADATA);

  const [analysisSearchInput, setAnalysisSearchInput] = useState('');
  const [compareCheckedSymbols, setCompareCheckedSymbols] = useState([]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/portfolio');
      const data = await res.json();
      if (Array.isArray(data)) setMyPortfolio(data);
    } catch (e) { console.error("Fetch Error"); }
  };

  useEffect(() => { fetchPortfolio(); }, []);
  
  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(isDarkMode));
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (Array.isArray(myPortfolio) && myPortfolio.length > 0) {
      const ownedSymbols = myPortfolio.map(p => p.symbol);
      setCompareCheckedSymbols(ownedSymbols);
    }
  }, [myPortfolio]);

  // 💡 거래 로직 (관심종목 자동 추가 기능 포함)
  const handleTransaction = async (type) => {
    if (!newSymbol || !newQuantity) return toast.warn("종목과 수량을 확인해주세요!");
    try {
      const res = await fetch(`http://localhost:5000/api/portfolio/${type.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: newSymbol.toUpperCase(), quantity: parseFloat(newQuantity) }),
      });
      
      if (res.ok) { 
        toast.success(`${newSymbol.toUpperCase()} 거래가 완료되었습니다!`); 
        fetchPortfolio(); 
        
        // 💡 핵심 로직: 매수 시 관심종목에 없으면 자동으로 추가!
        if (type === 'BUY' && !watchList.includes(newSymbol.toUpperCase())) {
          setWatchList(prev => [...prev, newSymbol.toUpperCase()]);
        }
      } else { 
        toast.error("거래에 실패했습니다."); 
      }
    } catch (e) { toast.error("서버 에러가 발생했습니다."); }
    
    setNewSymbol(''); setNewQuantity(''); setShowDropdown(false);
  };

  const handleCompareCheckboxChange = (symbol) => {
    setCompareCheckedSymbols(prev => prev.includes(symbol) ? prev.filter(s => s !== symbol) : [...prev, symbol]);
  };

  const safePortfolio = Array.isArray(myPortfolio) ? myPortfolio : [];
  const totalProfit = safePortfolio.reduce((acc, cur) => acc + (cur.profit || 0), 0);
  const insight = getEnhancedInsight(safePortfolio);

  const calculateDividends = () => {
    let preTax = 0;
    safePortfolio.forEach(item => {
      const yieldRate = ETF_METADATA[item.symbol]?.dividendYield || 0.015; 
      preTax += (item.quantity * item.currentPrice) * yieldRate;
    });
    return { preTax, postTax: preTax * 0.85 };
  };
  const dividends = calculateDividends();

  const tabStyle = (name) => ({
    padding: '12px 25px', cursor: 'pointer', border: 'none', background: 'none',
    borderBottom: activeTab === name ? '3px solid #e74c3c' : '3px solid transparent',
    color: activeTab === name ? '#e74c3c' : 'var(--text-secondary)', fontWeight: 'bold'
  });

  return (
    <div className="App" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h1 style={{ fontWeight: '800' }}>Smart <span style={{ color: '#e74c3c' }}>Portfolio</span></h1>
        <button onClick={() => setIsDarkMode(!isDarkMode)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>
          {isDarkMode ? '🌙' : '☀️'}
        </button>
      </header>

      <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '30px' }}>
        <button style={tabStyle('overview')} onClick={() => setActiveTab('overview')}>내 지갑 요약</button>
        <button style={tabStyle('analysis')} onClick={() => setActiveTab('analysis')}>심층 분석 & 뉴스</button>
        <button style={tabStyle('compare')} onClick={() => setActiveTab('compare')}>수익률 비교 센터</button>
      </nav>

      {activeTab === 'overview' && (
        <section>
          {/* 스마트 거래소 */}
          <div style={{ marginBottom: '30px', padding: '25px', background: 'var(--card-bg)', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', gap: '15px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
            <h3 style={{ margin: '0 15px 0 0' }}>🛒 스마트 거래소</h3>
            
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="종목 (예: VOO)" 
                value={newSymbol} 
                onChange={e => {
                  setNewSymbol(e.target.value.toUpperCase());
                  setShowDropdown(e.target.value.length > 0);
                }} 
                style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', width: '150px', fontWeight: 'bold' }} 
              />
              {showDropdown && (
                <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: '8px', padding: 0, margin: '5px 0 0 0', listStyle: 'none', zIndex: 10, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', maxHeight: '150px', overflowY: 'auto' }}>
                  {availableTickers.filter(t => t.includes(newSymbol)).map(ticker => (
                    <li 
                      key={ticker} 
                      onClick={() => { setNewSymbol(ticker); setShowDropdown(false); }}
                      style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid var(--card-border)', color: 'var(--text-primary)' }}
                    >
                      {ticker}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input type="number" placeholder="수량" value={newQuantity} onChange={e=>setNewQuantity(e.target.value)} style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', width: '100px' }} />
            <button onClick={()=>handleTransaction('BUY')} style={{ padding: '12px 30px', borderRadius: '12px', background: '#e74c3c', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>매수</button>
            <button onClick={()=>handleTransaction('SELL')} style={{ padding: '12px 30px', borderRadius: '12px', background: '#3498db', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>매도</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            
            {/* 실시간 총 손익 */}
            <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '25px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>💰 실시간 총 손익</span>
              <h1 style={{ fontSize: '3rem', margin: '10px 0', color: totalProfit >= 0 ? '#e74c3c' : '#3498db' }}>
                ${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h1>
              <div style={{ marginTop: '15px', padding: '15px', background: 'var(--bg-color)', borderRadius: '15px', fontSize: '0.9rem' }}>
                <strong>AI 분석:</strong> 평균 수익률 <strong>{insight.profit}%</strong>, 종합 리스크 <strong>{insight.score}/10점</strong>입니다.<br/>
                <span style={{ color: 'var(--text-secondary)' }}>{insight.text}</span>
              </div>
            </div>

            {/* 예상 연간 배당금 */}
            <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '30px', borderRadius: '25px', textAlign: 'left' }}>
              <span style={{ fontSize: '1rem', color: '#2ecc71', fontWeight: 'bold' }}>💵 예상 연간 배당금</span>
              <h2 style={{ fontSize: '1.6rem', margin: '15px 0 5px 0', color: 'var(--text-secondary)' }}>
                세전 총액: <span style={{ color: 'var(--text-primary)' }}>${dividends.preTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </h2>
              <h2 style={{ fontSize: '1.3rem', margin: '0 0 15px 0', color: '#2ecc71', wordBreak: 'keep-all', lineHeight: '1.4' }}>
                세후 수령액 (15% 공제):<br/>${dividends.postTax.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                * {safePortfolio.slice(0, 4).map(p => p.symbol).join(', ')} 등 주요 종목의 예상 데이터를 기반으로 계산되었습니다.
              </p>
            </div>

            {/* 보유 ETF 비중 분석 */}
            <div className="card" style={{ backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '25px', minHeight: '300px' }}>
              <h4 style={{ margin: '0 0 10px 0', textAlign: 'left' }}>💼 보유 ETF 비중 분석</h4>
              <PortfolioChart portfolio={safePortfolio} />
            </div>

          </div>

          {/* 보유 주식 현황 테이블 */}
          <div style={{ backgroundColor: 'var(--card-bg)', padding: '25px', borderRadius: '25px', marginBottom: '30px', textAlign: 'left' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>📋 내 보유 주식 현황</h3>
            {safePortfolio.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>보유 중인 주식이 없습니다.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--card-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '10px' }}>종목명</th>
                      <th style={{ padding: '10px' }}>보유 수량</th>
                      <th style={{ padding: '10px' }}>평균 단가</th>
                      <th style={{ padding: '10px' }}>현재가</th>
                      <th style={{ padding: '10px' }}>수익률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safePortfolio.map((item, idx) => {
                      const metadata = ETF_METADATA[item.symbol];
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                          <td style={{ padding: '15px 10px', fontWeight: 'bold' }}>
                            {item.symbol}
                            {metadata && (
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal', marginLeft: '8px' }}>
                                ({metadata.fullName})
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '15px 10px' }}>{item.quantity}주</td>
                          <td style={{ padding: '15px 10px' }}>${parseFloat(item.avg_price || 0).toFixed(2)}</td>
                          <td style={{ padding: '15px 10px' }}>${parseFloat(item.currentPrice || 0).toFixed(2)}</td>
                          <td style={{ padding: '15px 10px', fontWeight: 'bold', color: parseFloat(item.profitRate) >= 0 ? '#e74c3c' : '#3498db' }}>
                            {parseFloat(item.profitRate) > 0 ? '+' : ''}{parseFloat(item.profitRate || 0).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <h3 style={{ textAlign: 'left', margin: '0 0 15px 10px' }}>📈 관심 종목 (Watchlist)</h3>
          <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '20px' }}>
            {watchList.map(s => <SmartETFCard key={s} symbol={s} onDelete={() => setWatchList(prev => prev.filter(x => x !== s))} isSelected={selectedSymbol === s} onClick={() => { setSelectedSymbol(s); setActiveTab('analysis'); }} />)}
          </div>
        </section>
      )}

      {activeTab === 'analysis' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', textAlign: 'left' }}>
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <input 
                type="text" 
                placeholder="분석할 종목 검색 (예: SPY)" 
                value={analysisSearchInput} 
                onChange={e => setAnalysisSearchInput(e.target.value.toUpperCase())} 
                style={{ padding: '10px', borderRadius: '10px', border: '1px solid var(--card-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', flexGrow: 1 }} 
              />
              <button 
                onClick={() => {
                  if(analysisSearchInput) {
                    setSelectedSymbol(analysisSearchInput);
                    const name = ETF_METADATA[analysisSearchInput]?.fullName;
                    if(name) toast.info(`${analysisSearchInput} (${name}) 분석을 시작합니다.`);
                    else toast.info(`${analysisSearchInput} 종목 분석을 시작합니다.`);
                  }
                }}
                style={{ padding: '10px 20px', borderRadius: '10px', background: '#3498db', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
              >
                조회
              </button>
            </div>
            
            <h2>{selectedSymbol} Analysis</h2>
            <TrendChart symbol={selectedSymbol} />
            <NewsFeed symbol={selectedSymbol} />
          </div>
          <div style={{ background: 'var(--card-bg)', padding: '25px', borderRadius: '20px', height: 'fit-content' }}>
            <h4>보유 상세</h4>
            {safePortfolio.find(p => p.symbol === selectedSymbol) ? (
                <p>평단가: ${parseFloat(safePortfolio.find(p => p.symbol === selectedSymbol).avg_price || 0).toFixed(2)}</p>
            ) : <p>보유 중이지 않은 종목입니다.</p>}
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div style={{ textAlign: 'left' }}>
          <h2>Market Comparison</h2>
          
          <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px', marginBottom: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <h4 style={{ margin: 0 }}>📊 비교 대상 선택: </h4>
              {safePortfolio.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>비교를 위해 먼저 종목을 매수해주세요.</p>
              ) : (
                safePortfolio.map(item => (
                    <label key={item.symbol} style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input 
                            type="checkbox" 
                            checked={compareCheckedSymbols.includes(item.symbol)} 
                            onChange={() => handleCompareCheckboxChange(item.symbol)} 
                            style={{ cursor: 'pointer' }}
                        />
                        {item.symbol}
                    </label>
                ))
              )}
          </div>

          <div style={{ background: 'var(--card-bg)', padding: '30px', borderRadius: '25px' }}>
            {compareCheckedSymbols.length >= 2 ? (
              <ComparisonChart symbols={compareCheckedSymbols} />
            ) : (
              <p style={{ textAlign: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
                {safePortfolio.length < 2 
                  ? "비교 분석을 위해 최소 2개 이상의 종목이 필요합니다. 먼저 종목을 매수해주세요." 
                  : "차트에 나타낼 종목을 위 체크박스에서 2개 이상 선택해주세요."
                }
              </p>
            )}
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" theme="dark" autoClose={2000} />
    </div>
  );
}

export default App;