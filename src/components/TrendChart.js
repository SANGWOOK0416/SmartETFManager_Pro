import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ symbol }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!symbol) return;

    const fetchChartData = async () => {
      setLoading(true);
      try {
        // 💡 핵심! 외부 API가 아니라 '내 로컬 백엔드 서버'로 요청을 보냄 (프록시 아키텍처)
        // (만약 백엔드 포트가 5000이 아니라면 본인 포트에 맞게 수정해 줘!)
        const res = await fetch(`http://localhost:5000/api/chart/${symbol}`);
        
        if (!res.ok) throw new Error("서버 응답 에러");
        
        const json = await res.json();

        // 야후 파이낸스 데이터를 Recharts가 그리기 좋게 예쁘게 가공
        const formattedData = json.map((dayData) => {
          const date = new Date(dayData.date);
          return {
            date: `${date.getMonth() + 1}/${date.getDate()}`, // 예: "4/1"
            open: dayData.open,
            high: dayData.high,
            low: dayData.low,
            close: dayData.close // 종가 기준으로 차트를 그림
          };
        });

        setData(formattedData);
      } catch (error) {
        console.error("차트 데이터를 불러오는 중 에러 발생:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol]);

  // 커스텀 툴팁 (마우스를 올렸을 때 야후 파이낸스의 정밀한 OHLC 데이터를 모두 보여줌)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ backgroundColor: 'var(--card-bg)', padding: '10px', borderRadius: '8px', border: '1px solid var(--card-border)', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: 'var(--text-primary)' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{label}일자 주가 흐름</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#e74c3c' }}>종가(Close): ${data.close.toFixed(2)}</p>
          <p style={{ margin: 0, fontSize: '12px' }}>시가(Open): ${data.open.toFixed(2)}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#2ecc71' }}>고가(High): ${data.high.toFixed(2)}</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#3498db' }}>저가(Low): ${data.low.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>{symbol} 주가 데이터 프록시 연동 중... ⚙️</div>;
  if (data.length === 0) return <div style={{ height: '320px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>데이터가 없습니다.</div>;

  return (
    <div style={{ width: '100%', height: 320, backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '10px 0' }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* 일반 LineChart 대신 AreaChart를 써서 하단이 그라데이션으로 채워지는 훨씬 고급스러운 UI 적용! */}
        <AreaChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3498db" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3498db" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
          <XAxis dataKey="date" stroke="var(--text-secondary)" tick={{ fontSize: 12 }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="var(--text-secondary)" tick={{ fontSize: 12 }} tickFormatter={(value) => `$${value.toFixed(2)}`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="close" stroke="#3498db" fillOpacity={1} fill="url(#colorClose)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;