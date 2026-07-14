import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API from '../../api/axios';
import CallButton from '../../components/CallButton';
import CallHistory from '../../components/CallHistory';
import SellerAttendance from './SellerAttendance';
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
  const [managerContact, setManagerContact] = useState(null);

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
      setError(t.errorLoading);
    } finally {
      setLoading(false);
    }
  }, [t.errorLoading]);

  const fetchManagerContact = useCallback(async () => {
    try {
      const response = await API.get('/calls/contacts');
      setManagerContact(response.data?.contacts?.[0] || null);
    } catch (err) {
      console.error('Unable to load manager call contact', err);
    }
  }, []);

  useEffect(() => {
    fetchTodayStats(hasFetchedStats);
    fetchManagerContact();
    const interval = setInterval(() => {
      fetchTodayStats(true);
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchTodayStats, fetchManagerContact]);

  const summaryRows = [
    { label: t('seller.total_visits'), value: loading ? '--' : String(stats.visits).padStart(2, '0') },
    { label: t('seller.total_sales'), value: loading ? '--' : currencyFormatter.format(stats.sales) },
    { label: t('seller.total_items'), value: loading ? '--' : stats.items }
  ];

  return (
    <div className="space-y-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        {managerContact && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">Manager support</p>
            <p className="mt-1 text-sm font-black text-slate-950">{managerContact.name || 'Manager'}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <CallButton targetUserId={managerContact.id} type="voice" label="Call" />
              <CallButton targetUserId={managerContact.id} type="video" label="Video" />
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <SellerAttendance />
        </div>
      </div>

      <Link
        to="/sell/shop"
        className="flex h-14 mt-2 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
      >
        <Plus size={17} />
        <span>{t('seller.start_selling')}</span>
      </Link>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-4 text-xs font-black text-slate-950">
          {t.todaySummary}
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
      
      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm mt-6">
        <h2 className="mb-4 text-xs font-black text-slate-950">Recent calls</h2>
        <CallHistory limit={10} />
      </section>
    </div>
  );
};

export default SellerDashboard;
