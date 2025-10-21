"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 28000, label: 'January' },
  { month: 'Feb', revenue: 31000, label: 'February' },
  { month: 'Mar', revenue: 29000, label: 'March' },
  { month: 'Apr', revenue: 35000, label: 'April' },
  { month: 'May', revenue: 32000, label: 'May' },
  { month: 'Jun', revenue: 51000, label: 'June' },
  { month: 'Jul', revenue: 48000, label: 'July' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
        <p className="text-white text-sm font-medium">{`${label}: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  
  if (payload.month === 'Jun') {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth={2}
          className="drop-shadow-lg"
        />
        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="#60a5fa"
        />
      </g>
    );
  }
  return null;
};

const SalesChart = () => {
  return (
    <div className="rounded-xl p-6 text-white">

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={revenueData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="50%" stopColor="#1e40af" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            
            <XAxis 
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              className="text-gray-400"
            />
            
            <YAxis 
              hide 
            />
            
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#374151', strokeWidth: 1, strokeDasharray: '2 2' }}
            />
            
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#revenueGradient)"
              dot={<CustomDot />}
              activeDot={{ 
                r: 6, 
                fill: '#60a5fa', 
                stroke: '#1e40af', 
                strokeWidth: 2 
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="text-gray-400">
          Peak: <span className="text-blue-400 font-medium">$51,000</span>
        </div>
        <div className="text-gray-400">
          Avg: <span className="text-green-400 font-medium">$36,286</span>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;