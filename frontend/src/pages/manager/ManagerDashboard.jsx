import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Users, FileSpreadsheet, IndianRupee, TrendingUp } from 'lucide-react';
import DashboardHeader from './components/DashboardHeader';
import StatCards from './components/StatCards';
import SalesChartSection from './components/SalesChartSection';
import SellerPerformanceTable from './components/SellerPerformanceTable';
import CollectionStatsCards from './components/CollectionStatsCards';
import RecentCollectionsTable from './components/RecentCollectionsTable';
import { useManagerDashboardData, getRange } from './useManagerDashboardData';

const numberFormatter = new Intl.NumberFormat('en-IN');
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});
const recentCollectionsLimit = 20;

const defaultCustomRange = getRange('weekly');

const tabs = [
  { id: 'daily', labelKey: 'manager.tabs.daily' },
  { id: 'weekly', labelKey: 'manager.tabs.weekly' },
  { id: 'monthly', labelKey: 'manager.tabs.monthly' },
  { id: 'yearly', labelKey: 'manager.tabs.yearly' },
  { id: 'custom', labelKey: 'manager.tabs.custom_range' }
];

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState('weekly');
  const [customRange, setCustomRange] = useState(defaultCustomRange);
  const [appliedCustomRange, setAppliedCustomRange] = useState(defaultCustomRange);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    summary,
    records,
    chartData,
    summaryLoading,
    recordsLoading,
    chartLoading,
    error,
    collectionStats,
    recentCollections,
    collectionsLoading,
    callContactsBySellerId,
    handleDeleteSellerRecords
  } = useManagerDashboardData(activeTab, appliedCustomRange);

  const { sellerRows, totals } = useMemo(() => {
    const sellerMap = new Map();
    const term = searchTerm.toLowerCase();

    records.forEach((record) => {
      const sellerId = record.sellerId?._id || 'unknown';
      const sellerName = record.sellerId?.name || 'Unknown Seller';

      if (!sellerMap.has(sellerId)) {
        sellerMap.set(sellerId, {
          sellerId,
          seller: sellerName,
          totalRecords: 0,
          totalShops: 0,
          totalItems: 0,
          totalSales: 0,
          totalPending: 0
        });
      }

      const row = sellerMap.get(sellerId);
      row.totalRecords += 1;
      row.totalShops += 1;
      row.totalItems += record.items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0;
      row.totalSales += Number(record.totalAmount || 0);
      row.totalPending += Number(record.pendingAmount || 0);
    });

    const rows = Array.from(sellerMap.values())
      .filter(r => r.seller.toLowerCase().includes(term))
      .sort((a, b) => b.totalSales - a.totalSales);

    const calculatedTotals = rows.reduce((acc, curr) => ({
      totalRecords: acc.totalRecords + curr.totalRecords,
      totalShops: acc.totalShops + curr.totalShops,
      totalItems: acc.totalItems + curr.totalItems,
      totalSales: acc.totalSales + curr.totalSales,
      totalPending: acc.totalPending + curr.totalPending
    }), { totalRecords: 0, totalShops: 0, totalItems: 0, totalSales: 0, totalPending: 0 });

    return { sellerRows: rows, totals: calculatedTotals };
  }, [records, searchTerm]);

  const stats = [
    {
      label: 'Total Sellers',
      value: numberFormatter.format(summary.totalSellers || 0),
      accent: 'text-blue-700',
      iconBg: 'bg-blue-50',
      icon: Users
    },
    {
      label: 'Total Records',
      value: numberFormatter.format(summary.totalRecords || 0),
      accent: 'text-violet-700',
      iconBg: 'bg-violet-50',
      icon: FileSpreadsheet
    },
    {
      label: 'Sales This Month',
      value: currencyFormatter.format(summary.monthlyTotal || 0),
      accent: 'text-emerald-700',
      iconBg: 'bg-emerald-50',
      icon: IndianRupee
    },
    {
      label: 'Sales This Year',
      value: currencyFormatter.format(summary.yearlyTotal || 0),
      accent: 'text-amber-700',
      iconBg: 'bg-amber-50',
      icon: TrendingUp
    },
    {
      label: 'Total Pending',
      value: currencyFormatter.format(totals.totalPending || 0),
      accent: 'text-red-700',
      iconBg: 'bg-red-50',
      icon: IndianRupee
    }
  ];

  const currentDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-5 bg-gradient-to-br from-purple-50 via-indigo-50 to-white p-3 sm:space-y-6 sm:p-5 lg:space-y-8 lg:p-8">
      <DashboardHeader 
        onAddNew={() => navigate('/manager/records')} 
        currentDate={currentDate}
      />

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <StatCards stats={stats} loading={summaryLoading} />

      <SalesChartSection chartData={chartData} chartLoading={chartLoading} />

{/* 4. Seller Performance Table */}
      <SellerPerformanceTable
        sellerRows={sellerRows}
        totals={totals}
        recordsLoading={recordsLoading}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onDeleteRecords={handleDeleteSellerRecords}
        onRowClick={(sellerId) => navigate(`/manager/seller/${sellerId}`)}
        activeTab={activeTab}
        tabs={tabs}
        onTabChange={setActiveTab}
        customRange={customRange}
        onCustomRangeChange={setCustomRange}
        onApplyCustomRange={() => setAppliedCustomRange(customRange)}
        callContactsBySellerId={callContactsBySellerId}
      />
      

      <CollectionStatsCards collectionStats={collectionStats} />
{/* 5. Recent Collections Table */}
      <RecentCollectionsTable 
        recentCollections={recentCollections}
        collectionsLoading={collectionsLoading}
        onViewAll={() => navigate('/manager/collections')}
        recentCollectionsLimit={recentCollectionsLimit}
      />
    </div>
  );
};

export default ManagerDashboard;
