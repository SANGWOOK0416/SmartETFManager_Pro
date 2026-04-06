require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); 
const YahooFinance = require('yahoo-finance2').default; 

// 💡 [추가] 서버 메모리 캐싱 설정 (60초 동안 데이터 기억)
const NodeCache = require('node-cache');
const apiCache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

const yahooFinance = new YahooFinance(); 
const app = express();
const port = process.env.PORT || 5000;

app.use(cors()); 
app.use(express.json()); 

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'etf_db',   
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// =====================================================================
// 📈 [캐싱 적용] 차트 API 
// =====================================================================
app.get('/api/chart/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const cacheKey = `chart_${symbol}`;

  // 1. 캐시(메모리)에 데이터가 있으면 API 호출 없이 즉시 반환! (속도 10배 증가)
  if (apiCache.has(cacheKey)) {
    console.log(`[Cache HIT] ${symbol} 차트 데이터`);
    return res.json(apiCache.get(cacheKey));
  }

  try {
    const endDateObj = new Date();
    const startDateObj = new Date();
    startDateObj.setMonth(endDateObj.getMonth() - 1);
    const period1 = startDateObj.toISOString().split('T')[0];
    const period2 = endDateObj.toISOString().split('T')[0];
    
    const result = await yahooFinance.historical(symbol, { period1, period2, interval: '1d' });
    
    // 2. 야후에서 가져온 새 데이터를 캐시에 저장
    apiCache.set(cacheKey, result);
    res.json(result); 
  } catch (error) {
    res.status(500).json({ error: '차트 로드 실패' });
  }
});

// =====================================================================
// 📰 [캐싱 적용] 뉴스 API
// =====================================================================
app.get('/api/news/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const cacheKey = `news_${symbol}`;

  if (apiCache.has(cacheKey)) {
    return res.json(apiCache.get(cacheKey));
  }

  try {
    const result = await yahooFinance.search(symbol, { newsCount: 4 }); 
    const newsData = result.news || [];
    apiCache.set(cacheKey, newsData);
    res.json(newsData); 
  } catch (error) {
    res.status(500).json({ error: '뉴스 로드 실패' });
  }
});

// =====================================================================
// 💼 [수정됨] 포트폴리오 조회 API
// =====================================================================
app.get('/api/portfolio', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM portfolios');
    if (rows.length === 0) return res.json([]);

    const symbols = rows.map(r => r.symbol);
    const quotes = await yahooFinance.quote(symbols);

    const enrichedData = rows.map(item => {
      const liveData = quotes.find(q => q.symbol === item.symbol);
      const currentPrice = liveData ? liveData.regularMarketPrice : 0;
      const totalCost = item.quantity * item.avg_price;
      const currentValue = item.quantity * currentPrice;
      const profit = currentValue - totalCost;
      const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0;

      return {
        ...item,
        currentPrice,
        profit,
        profitRate
      };
    });

    res.json(enrichedData);
  } catch (error) {
    res.status(500).json({ error: '포트폴리오 계산 실패' });
  }
});

app.post('/api/portfolio/buy', async (req, res) => {
  const { symbol, quantity } = req.body;
  try {
    const quote = await yahooFinance.quote(symbol);
    const buyPrice = quote.regularMarketPrice;
    const [existing] = await pool.query('SELECT * FROM portfolios WHERE symbol = ?', [symbol]);
    
    if (existing.length > 0) {
      const oldQty = parseFloat(existing[0].quantity);
      const oldAvg = parseFloat(existing[0].avg_price);
      const newQty = parseFloat(quantity);
      const newAvg = ((oldAvg * oldQty) + (buyPrice * newQty)) / (oldQty + newQty);
      
      await pool.query('UPDATE portfolios SET quantity = quantity + ?, avg_price = ? WHERE symbol = ?', [newQty, newAvg, symbol]);
    } else {
      await pool.query('INSERT INTO portfolios (symbol, quantity, avg_price) VALUES (?, ?, ?)', [symbol, quantity, buyPrice]);
    }
    res.json({ message: '매수 성공', price: buyPrice });
  } catch (error) {
    res.status(500).json({ error: '매수 실패' });
  }
});

app.post('/api/portfolio/sell', async (req, res) => {
  const { symbol, quantity } = req.body;
  try {
    const [existing] = await pool.query('SELECT * FROM portfolios WHERE symbol = ?', [symbol]);
    if (existing.length > 0 && existing[0].quantity >= quantity) {
      const finalQuantity = existing[0].quantity - quantity;
      if (finalQuantity === 0) await pool.query('DELETE FROM portfolios WHERE symbol = ?', [symbol]);
      else await pool.query('UPDATE portfolios SET quantity = ? WHERE symbol = ?', [finalQuantity, symbol]);
      res.json({ message: '매도 성공' });
    } else {
      res.status(400).json({ error: '수량 부족' });
    }
  } catch (error) {
    res.status(500).json({ error: '매도 실패' });
  }
});

app.listen(port, () => console.log(`🚀 최적화된 서버 가동 중 (포트 ${port})`));