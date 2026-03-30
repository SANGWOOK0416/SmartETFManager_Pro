import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3498db', '#2ecc71', '#f1c40f', '#e74c3c', '#9b59b6', '#34495e', '#1abc9c'];

const PortfolioChart = ({ portfolio }) => {
  if (!portfolio || portfolio.length === 0) {
    return (
      <div style={{ padding: '40px 20px', color: 'var(--text-secondary)', textAlign: 'center', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
        텅~ 💸 <br/>
        아직 매수한 종목이 없습니다.<br/>
        위에서 첫 ETF를 매수해 보세요!
      </div>
    );
  }

  return (
    // 💡 [수정됨] 차트 영역 높이를 글자가 나올 공간까지 고려해 살짝 높임 (320 -> 340)
    <div style={{ width: '100%', height: 340, backgroundColor: 'var(--bg-color)', borderRadius: '8px', padding: '10px 0' }}>
      <ResponsiveContainer width="100%" height="100%">
        {/* 💡 [수정됨] 차트 전체에 상하좌우 여백(margin)을 듬뿍 주어서 라벨 글자가 잘리지 않게 함 */}
        <PieChart margin={{ top: 20, right: 60, left: 60, bottom: 10 }}>
          <Pie
            data={portfolio}
            cx="50%"
            cy="50%"
            innerRadius={60}
            // 💡 [수정됨] 도넛의 바깥 반지름을 살짝 줄임 (90 -> 80)
            // 도넛 크기를 줄이는 대신 글자가 놀 수 있는 여유 공간을 확보!
            outerRadius={80}
            paddingAngle={5}
            dataKey="quantity"
            nameKey="symbol"
            labelLine={true} // 라벨과 조각을 잇는 선을 보여줌 (가독성 향상)
            // 💡 [수정됨] 라벨 글자가 다크모드/라이트모드 상관없이 잘 보이도록 스타일 수정
            label={({ symbol, percent }) => `${symbol} ${(percent * 100).toFixed(0)}%`}
            // 라벨 스타일을 차트 컴포넌트 내부 색상으로 고정
            labelStyle={{ fill: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            {portfolio.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          
          <Tooltip 
            formatter={(value, name) => [`${value}주`, `${name}`]} 
            allowEscapeViewBox={{ x: true, y: true }} 
            contentStyle={{ 
              borderRadius: '8px', 
              border: 'none', 
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
              whiteSpace: 'nowrap',
              color: '#333'
            }}
          />
          
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;