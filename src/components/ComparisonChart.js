import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ComparisonChart = ({ symbols }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComparisonData = async () => {
      setLoading(true);
      try {
        // 여러 종목의 데이터를 동시에 가져옴
        const promises = symbols.map(s => fetch(`http://localhost:5000/api/chart/${s}`).then(res => res.json()));
        const results = await Promise.all(promises);

        // 데이터를 날짜별로 합치고 수익률(%)로 변환
        const combined = results[0].map((entry, index) => {
          const date = new Date(entry.date).toLocaleDateString();
          let row = { date };
          
          results.forEach((result, i) => {
            const firstPrice = result[0].close; // 첫 날 가격을 기준(100%)으로 잡음
            const currentPrice = result[index]?.close || firstPrice;
            const returnRate = ((currentPrice - firstPrice) / firstPrice) * 100;
            row[symbols[i]] = parseFloat(returnRate.toFixed(2));
          });
          return row;
        });

        setData(combined);
      } catch (e) {
        console.error("비교 데이터 로드 실패", e);
      } finally {
        setLoading(false);
      }
    };

    if (symbols.length > 0) fetchComparisonData();
  }, [symbols]);

  if (loading) return <div style={{ color: '#888', padding: '50px' }}>수익률 분석 중...</div>;

  return (
    <div style={{ width: '100%', height: 400, backgroundColor: 'var(--card-bg)', padding: '20px', borderRadius: '15px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
          <XAxis dataKey="date" stroke="var(--text-secondary)" fontSize={12} />
          <YAxis unit="%" stroke="var(--text-secondary)" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px' }}
            itemStyle={{ fontSize: '14px' }}
          />
          <Legend />
          {symbols.map((s, i) => (
            <Line 
              key={s} 
              type="monotone" 
              dataKey={s} 
              stroke={['#3498db', '#e74c3c', '#f1c40f'][i % 3]} 
              strokeWidth={3} 
              dot={false} 
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;