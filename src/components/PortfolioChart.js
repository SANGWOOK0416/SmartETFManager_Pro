import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3498db', '#e74c3c', '#f1c40f', '#2ecc71', '#9b59b6', '#e67e22'];

const PortfolioChart = ({ portfolio }) => {
  // 💡 핵심 수정 1: 문자열을 숫자로 확실히 변환 (parseFloat)
  // 💡 핵심 수정 2: 비중 = 수량 * 현재가 (자산 가치 기준으로 파이 조각을 나눔)
  const chartData = portfolio.map(item => ({
    name: item.symbol,
    value: parseFloat(item.quantity || 0) * parseFloat(item.currentPrice || 0)
  })).filter(item => item.value > 0); // 혹시 모를 0원짜리 데이터는 에러 방지를 위해 제외

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
        데이터를 계산 중입니다...
      </div>
    );
  }

  return (
    // 💡 부모 div에 확실한 height(300px)를 주어야 ResponsiveContainer가 작동합니다.
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e1e1e', border: 'none', borderRadius: '8px', color: '#fff' }}
            itemStyle={{ color: '#fff' }}
            formatter={(value) => `$${value.toFixed(2)}`} // 툴팁에 달러($) 표시 추가
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;