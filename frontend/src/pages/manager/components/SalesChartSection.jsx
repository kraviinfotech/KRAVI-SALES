import React, { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const LazySalesBarChart = lazy(() => import('recharts').then((mod) => ({
  default: ({ data, yAxisMax }) => (
    <mod.ResponsiveContainer width="100%" height="100%">
      <mod.BarChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
        <mod.CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
        <mod.XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          fontSize={12}
          stroke="#64748b"
        />
        <mod.YAxis
          allowDecimals={false}
          axisLine={false}
          domain={[0, yAxisMax]}
          tickLine={false}
          fontSize={12}
          stroke="#64748b"
          tickFormatter={(value) => (value === 0 ? '0' : `₹${numberFormatter.format(value)}`)}
        />
        <mod.Tooltip
          cursor={{ fill: '#f8fafc' }}
          formatter={(value) => [currencyFormatter.format(value), 'Sales']}
          contentStyle={{
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.12)',
            fontSize: '12px'
          }}
        />
        <mod.Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={42} />
      </mod.BarChart>
    </mod.ResponsiveContainer>
  ),
})));

const ChartFallback = () => (
  <div className="flex h-full items-center justify-center">
    <Loader2 className="animate-spin text-blue-700" size={22} />
  </div>
);

const SalesChartSection = ({ chartData, chartLoading }) => {
  const maxChartSales = Math.max(...chartData.map((item) => item.sales), 0);
  const yAxisMax = maxChartSales > 0 ? Math.ceil(maxChartSales * 1.2) : 1;

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Sales Trend</p>
          <h2 className="text-base font-black text-slate-950">Weekly Sales Chart</h2>
        </div>
        <div className="rounded-md bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
          Last 7 days
        </div>
      </div>

      <div className="h-80 p-6 rounded-xl bg-white/70 backdrop-blur-lg shadow-lg">
        {chartLoading ? (
          <ChartFallback />
        ) : (
          <Suspense fallback={<ChartFallback />}>
            <LazySalesBarChart data={chartData} yAxisMax={yAxisMax} />
          </Suspense>
        )}
      </div>
    </section>
  );
};

export default SalesChartSection;
