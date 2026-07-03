import React from 'react';
import StatCard from '../../../components/StatCard';
import { TrendingUp, DollarSign, Package, Landmark, ShoppingCart } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

const ReportsSummaryCards = ({ summary, stats }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    <StatCard
      title="Total Sales (Month)"
      value={currencyFormatter.format(summary.monthlyTotal)}
      icon={TrendingUp}
      colorClass="text-emerald-600"
    />
    <StatCard
      title="Total Sales (Year)"
      value={currencyFormatter.format(summary.yearlyTotal)}
      icon={DollarSign}
      colorClass="text-blue-600"
    />
    <StatCard
      title="Total Records"
      value={stats.totalRecords}
      icon={Package}
      colorClass="text-violet-600"
    />
    <StatCard
      title="Shops Visited"
      value={stats.uniqueShops}
      icon={Landmark}
      colorClass="text-orange-600"
    />
    <StatCard
      title="Total Items Sold"
      value={stats.totalItems}
      icon={ShoppingCart}
      colorClass="text-purple-600"
    />
  </div>
);

export default ReportsSummaryCards;
