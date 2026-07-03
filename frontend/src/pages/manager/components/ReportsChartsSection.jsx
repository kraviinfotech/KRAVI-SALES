import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, Users } from 'lucide-react';

const COLORS = ['#1D4ED8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const ChartCard = ({ icon: Icon, iconClass, title, height = 'h-80', children }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center gap-2 mb-6">
      <Icon size={18} className={iconClass} />
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{title}</h3>
    </div>
    <div className={height}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  </div>
);

const ReportsChartsSection = ({ chartData, sellerPerformance, shopPerformance, categoryWiseData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Sales Trend */}
    <ChartCard icon={TrendingUp} iconClass="text-blue-700" title="Sales Trend Chart">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="name" fontSize={10} fontWeight="bold" stroke="#64748b" axisLine={false} tickLine={false} />
        <YAxis fontSize={10} fontWeight="bold" stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
        <Line type="monotone" dataKey="sales" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4, fill: '#1D4ED8' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ChartCard>

    {/* Category Wise Sales */}
    <ChartCard icon={PieIcon} iconClass="text-emerald-600" title="Category Wise Sales">
      <PieChart>
        <Pie data={categoryWiseData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {categoryWiseData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend verticalAlign="bottom" height={36} iconType="circle" />
      </PieChart>
    </ChartCard>

    {/* Seller Performance */}
    <ChartCard icon={Users} iconClass="text-violet-600" title="Seller Performance">
      <BarChart data={sellerPerformance} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <XAxis type="number" fontSize={10} stroke="#64748b" />
        <YAxis dataKey="name" type="category" fontSize={10} fontWeight="bold" stroke="#64748b" width={80} />
        <Tooltip />
        <Bar dataKey="sales" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Revenue" />
        <Bar dataKey="records" fill="#DDD6FE" radius={[0, 4, 4, 0]} name="Records" />
      </BarChart>
    </ChartCard>

    {/* Shop Value Distribution */}
    <ChartCard icon={PieIcon} iconClass="text-orange-600" title="Shop Value Distribution (Pie Chart)">
      <PieChart>
        <Pie
          data={shopPerformance}
          dataKey="sales"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={110}
          innerRadius={50}
          paddingAngle={3}
          label={({ name, percent }) =>
            percent > 0.04 ? `${name.slice(0, 12)}… ${(percent * 100).toFixed(1)}%` : ''
          }
          labelLine={false}
        >
          {shopPerformance.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [currencyFormatter.format(value), 'Sales']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
        <Legend
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>
              {value.slice(0, 18)}{value.length > 18 ? '…' : ''}
            </span>
          )}
        />
      </PieChart>
    </ChartCard>
  </div>
);

export default ReportsChartsSection;
