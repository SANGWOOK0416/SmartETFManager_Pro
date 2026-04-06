import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ETF_ANALYSIS_DB } from './SmartETFCard';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const SectorChart = ({ portfolio }) => {
  const sectorMap = {};
  
  portfolio.forEach(item => {
    const sector = ETF_ANALYSIS_DB[item.symbol]?.sector || 'Others';
    sectorMap[sector] = (sectorMap[sector] || 0) + item.quantity * (item.currentPrice || 0);
  });

  const data = Object.keys(sectorMap).map(key => ({ name: key, value: sectorMap[key] }));

  return (
    <div style={{ width: '100%', height: 250 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} innerRadius={50} outerRadius={70} dataKey="value" label>
            {data.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.COLORS?.length || 5]} />)}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SectorChart;