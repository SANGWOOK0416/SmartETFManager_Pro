import React, { useState, useEffect } from 'react';
// 💡 방금 파이 차트 그릴 때 썼던 recharts를 여기서도 사용합니다!
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ symbol, apiKey }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 💡 데이터 가져오기 로직
  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // 최근 30일치 주가 흐름을 가져오기 위한 시간 계산 (UNIX 타임스탬프)
        const to = Math.floor(Date.now() / 1000);
        const from = to - (30 * 24 * 60 * 60); 
        
        // Finnhub의 '주식 캔들(Candle)' API를 호출합니다.
        const res = await fetch(`https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${apiKey}`);
        const json = await res.json();

        // API가 데이터를 정상적으로("ok") 주었을 때
        if (json.s === "ok") {
          // Recharts가 이해할 수 있는 형태의 배열로 데이터를 예쁘게 포장합니다.
          const formattedData = json.t.map((timestamp, index) => {
            const date = new Date(timestamp * 1000);
            return {
              date: `${date.getMonth() + 1}/${date.getDate()}`, // 예: "3/15"
              price: json.c[index] // 그 날의 종가(Close)
            };
          });
          setData(formattedData);
        } else {
          // 주말이거나 무료 API 한도 초과 시 빈 차트가 나오지 않게 방어
          console.warn("데이터가 없거나 API 한도 초과입니다.");
          setData([]); 
        }
      } catch (error) {
        console.error("차트 에러:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();

  // 🌟 [핵심] 빈 배열 [] 대신 [symbol]을 넣어서, 종목이 바뀔 때마다 재실행되게 만듭니다!
  }, [symbol, apiKey]); 

  // 로딩 중일 때 보여줄 화면
  if (loading) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        {symbol} 차트 불러오는 중... ⏳
      </div>
    );
  }

  // 데이터가 없을 때 보여줄 화면
  if (data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
        해당 종목의 차트 데이터가 없습니다.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 320, backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '10px 0' }}>
      {/* 📈 꺾은선 차트 그리기 */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          {/* 차트 배경의 흐린 격자무늬 */}
          <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
          
          {/* X축 (날짜) */}
          <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
          
          {/* Y축 (가격) */}
          <YAxis domain={['auto', 'auto']} stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
          
          {/* 마우스 올렸을 때 나오는 말풍선 */}
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, '종가']}
            labelStyle={{ color: '#000' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
          />
          
          {/* 진짜 주가를 이어주는 꺾은선 */}
          <Line 
            type="monotone" // 선을 부드러운 곡선으로 만듦
            dataKey="price" 
            stroke="#e74c3c" // 선 색상 (빨간색)
            strokeWidth={3} // 선 굵기
            dot={false} // 데이터 포인트(점) 숨기기 (깔끔하게)
            activeDot={{ r: 6 }} // 마우스 올린 곳만 점 크게 표시
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;