const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json()); // React에서 보내는 JSON 데이터를 읽기 위해 필수!

// 🗄️ DB 연결 설정 (비밀번호 꼭 수정하세요!)
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '7247', // 🔑 본인 비밀번호
    database: 'etf_db'
});

db.connect((err) => {
    if (err) {
        console.error('❌ DB 연결 실패:', err);
        return;
    }
    console.log('✅ MySQL 연결 성공!');
});

// ==========================================
// 🚀 여기서부터 진짜 API (백엔드 로직) 시작입니다!
// ==========================================

// 📥 1. 내 지갑 데이터 불러오기 (GET 요청)
app.get('/api/portfolio', (req, res) => {
    // DB에서 포트폴리오 테이블의 모든 데이터를 가져옵니다.
    db.query('SELECT symbol, quantity FROM portfolios', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results); // React로 데이터 전송!
    });
});

// 📤 2. 매수/매도 시 데이터 저장 및 업데이트 (POST 요청)
app.post('/api/portfolio', (req, res) => {
    const { symbol, quantity } = req.body; // React가 보낸 종목과 최종 수량

    // 만약 전량 매도해서 수량이 0이 되었다면? -> DB에서 아예 삭제!
    if (quantity <= 0) {
        db.query('DELETE FROM portfolios WHERE symbol = ?', [symbol], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: '전량 매도 완료 (DB 삭제)' });
        });
    } else {
        // DB에 해당 종목이 이미 있는지 확인
        db.query('SELECT * FROM portfolios WHERE symbol = ?', [symbol], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            if (results.length > 0) {
                // 이미 보유 중인 종목이면 -> 수량만 업데이트 (UPDATE)
                db.query('UPDATE portfolios SET quantity = ? WHERE symbol = ?', [quantity, symbol], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: '수량 업데이트 완료' });
                });
            } else {
                // 처음 사는 종목이면 -> 새로 추가 (INSERT)
                db.query('INSERT INTO portfolios (symbol, quantity, avg_price) VALUES (?, ?, 0)', [symbol, quantity], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: '신규 매수 완료' });
                });
            }
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 백엔드 API 서버가 http://localhost:${PORT} 에서 대기 중입니다.`);
});