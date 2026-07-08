import React, { useEffect, useState, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import { AlertCircle, Plus } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

let cachedStats = null;
let hasFetchedStats = false;

const SellerDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(cachedStats || { visits: 0, sales: 0, items: 0 });
  const [loading, setLoading] = useState(!hasFetchedStats);
  const [error, setError] = useState('');

  const fetchTodayStats = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await API.get('/sales/today-stats');
      const newStats = {
        visits: response.data.visits || 0,
        sales: response.data.sales || 0,
        items: response.data.items || 0
      };
      setStats(newStats);
      cachedStats = newStats;
      hasFetchedStats = true;
    } catch (err) {
        console.error(err);
        setError(t('seller.error_loading_today_summary'));
      } finally {
        setLoading(false);
      }
  }, [t]);

  useEffect(() => {
    fetchTodayStats(hasFetchedStats);
    
    // Refresh stats every 2 minutes for sellers
    const interval = setInterval(() => fetchTodayStats(true), 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTodayStats]);

  const summaryRows = [
    { label: t('seller.total_visits'), value: loading ? '--' : String(stats.visits).padStart(2, '0') },
    { label: t('seller.total_sales'), value: loading ? '--' : currencyFormatter.format(stats.sales) },
    { label: t('seller.total_items'), value: loading ? '--' : stats.items }
  ];

  return (
    <div className="space-y-16">
      <Link
        to="/sell/shop"
        className="flex h-14 mt-2 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
      >
        <Plus size={17} />
        <span>{t('seller.start_selling')}</span>
      </Link>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
  <h2 className="mb-4 text-xs font-black text-slate-950">
    {t('seller.today_summary')}
  </h2>

  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {summaryRows.map((row) => (
      <div
        key={row.label}
        className="rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm"
      >
        <p className="text-sm font-semibold text-slate-600">
          {row.label}
        </p>

        <p className="mt-2 text-2xl font-black text-slate-950">
          {row.value}
        </p>
      </div>
    ))}
  </div>
</section>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
