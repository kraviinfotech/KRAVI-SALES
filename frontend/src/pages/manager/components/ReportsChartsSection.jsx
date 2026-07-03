import React, { lazy, Suspense } from 'react';
import { TrendingUp, PieChart as PieIcon, Users } from 'lucide-react';

const COLORS = ['#1D4ED8', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const getChartItemKey = (item, fallbackPrefix) => {
  if (item?.id != null) return `${fallbackPrefix}-${item.id}`;
  if (item?.slug != null) return `${fallbackPrefix}-${item.slug}`;
  if (item?.name != null) return `${fallbackPrefix}-${item.name}`;
  return `${fallbackPrefix}-${item?.value ?? ''}`;
};

const ChartFallback = () => (
  <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">
    Loading chart…
  </div>
);

const LazySalesTrendChart = lazy(() => import('recharts').then((mod) => ({
  default: ({ data }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.LineChart data={data}>
        <mod.CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
        <mod.XAxis dataKey="name" fontSize={12} fontWeight="bold" stroke="#64748b" axisLine={false} tickLine={false} />
        <mod.YAxis fontSize={12} fontWeight="bold" stroke="#64748b" axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
        <mod.Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '12px' }} />
        <mod.Line type="monotone" dataKey="sales" stroke="#1D4ED8" strokeWidth={3} dot={{ r: 4, fill: '#1D4ED8' }} activeDot={{ r: 6 }} />
      </mod.LineChart>
    </mod.ResponsiveContainer>
  ),
})));

const LazyCategorySalesChart = lazy(() => import('recharts').then((mod) => ({
  default: ({ data, colors, getItemKey }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.PieChart>
        <mod.Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
          {data.map((item, index) => (
            <mod.Cell key={getItemKey(item, 'category')} fill={colors[index % colors.length]} />
          ))}
        </mod.Pie>
        <mod.Tooltip contentStyle={{ fontSize: '12px' }} />
        <mod.Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
      </mod.PieChart>
    </mod.ResponsiveContainer>
  ),
})));

const LazySellerPerformanceChart = lazy(() => import('recharts').then((mod) => ({
  default: ({ data }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.BarChart data={data} layout="vertical">
        <mod.CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
        <mod.XAxis type="number" fontSize={12} stroke="#64748b" />
        <mod.YAxis dataKey="name" type="category" fontSize={12} fontWeight="bold" stroke="#64748b" width={90} />
        <mod.Tooltip contentStyle={{ fontSize: '12px' }} />
        <mod.Bar dataKey="sales" fill="#8B5CF6" radius={[0, 4, 4, 0]} name="Revenue" />
        <mod.Bar dataKey="records" fill="#DDD6FE" radius={[0, 4, 4, 0]} name="Records" />
      </mod.BarChart>
    </mod.ResponsiveContainer>
  ),
})));

const LazyShopValueChart = lazy(() => import('recharts').then((mod) => ({
  default: ({ data, colors, currencyFormatter, getItemKey }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.PieChart>
        <mod.Pie
          data={data}
          dataKey="sales"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={45}
          paddingAngle={3}
          label={({ name, percent }) => (percent > 0.05 ? `${name.slice(0, 10)}… ${(percent * 100).toFixed(0)}%` : '')}
          labelLine={false}
          style={{ fontSize: '12px', fontWeight: 600 }}
        >
          {data.map((item, index) => (
            <mod.Cell key={getItemKey(item, 'shop')} fill={colors[index % colors.length]} />
          ))}
        </mod.Pie>
        <mod.Tooltip
          formatter={(value) => [currencyFormatter.format(value), 'Sales']}
          contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
        />
        <mod.Legend
          iconType="circle"
          iconSize={10}
          formatter={(value) => (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#334155' }}>
              {value.slice(0, 18)}{value.length > 18 ? '…' : ''}
            </span>
          )}
        />
      </mod.PieChart>
    </mod.ResponsiveContainer>
  ),
})));

const ChartCard = ({ icon: Icon, iconClass, title, height = 'h-80', children }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex items-center gap-2 mb-6">
      <Icon size={18} className={iconClass} />
      <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">{title}</h3>
    </div>
    <div className={height}>
      {children}
    </div>
  </div>
);

const ReportsChartsSection = ({ chartData, sellerPerformance, shopPerformance, categoryWiseData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Sales Trend */}
    <ChartCard icon={TrendingUp} iconClass="text-blue-700" title="Sales Trend Chart">
      <Suspense fallback={<ChartFallback />}>
        <LazySalesTrendChart data={chartData} />
      </Suspense>
    </ChartCard>

    {/* Category Wise Sales */}
    <ChartCard icon={PieIcon} iconClass="text-emerald-600" title="Category Wise Sales">
      <Suspense fallback={<ChartFallback />}>
        <LazyCategorySalesChart data={categoryWiseData} colors={COLORS} getItemKey={getChartItemKey} />
      </Suspense>
    </ChartCard>

    {/* Seller Performance */}
    <ChartCard icon={Users} iconClass="text-violet-600" title="Seller Performance">
      <Suspense fallback={<ChartFallback />}>
        <LazySellerPerformanceChart data={sellerPerformance} />
      </Suspense>
    </ChartCard>

    {/* Shop Value Distribution */}
    <ChartCard icon={PieIcon} iconClass="text-orange-600" title="Shop Value Distribution (Pie Chart)">
      <Suspense fallback={<ChartFallback />}>
        <LazyShopValueChart data={shopPerformance} colors={COLORS} currencyFormatter={currencyFormatter} getItemKey={getChartItemKey} />
      </Suspense>
    </ChartCard>
  </div>
);

export default ReportsChartsSection;