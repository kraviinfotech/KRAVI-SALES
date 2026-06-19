import React, { useEffect, useState, useCallback } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import API from '../../api/axios';
import { AlertCircle, Plus } from 'lucide-react';

const translations = {
  en: {
    startSelling: "Start Selling", todaySummary: "Today Summary", totalVisits: "Total Visits",
    totalSales: "Total Sales", totalItems: "Total Items", errorLoading: "Today summary could not be loaded."
  },
  hi: {
    startSelling: "बेचना शुरू करें", todaySummary: "आज का सारांश", totalVisits: "कुल विज़िट",
    totalSales: "कुल बिक्री", totalItems: "कुल आइटम", errorLoading: "आज का सारांश लोड नहीं हो पाया।"
  },
  mr: {
    startSelling: "विक्री सुरू करा", todaySummary: "आजचा सारांश", totalVisits: "एकूण भेटी",
    totalSales: "एकूण विक्री", totalItems: "एकूण वस्तू", errorLoading: "आजचा सारांश लोड होऊ शकला नाही."
  }
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const SellerDashboard = () => {
  const { lang } = useOutletContext(); // Get language from SellerLayout
  const t = translations[lang || 'en'];
  const [stats, setStats] = useState({ visits: 0, sales: 0, items: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTodayStats = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
        const response = await API.get('/sales/my-records');
        const today = new Date().toDateString();
        const todayRecords = response.data.filter((record) => new Date(record.visitDatetime).toDateString() === today);

        setStats({
          visits: todayRecords.length,
          sales: todayRecords.reduce((sum, record) => sum + Number(record.totalAmount || 0), 0),
          items: todayRecords.reduce((sum, record) => {
            const itemTotal = (record.items || []).reduce((itemSum, item) => {
              if (item.unit === 'weight') {
                return itemSum + 1; // Count weight-based items as 1
              } else {
                return itemSum + Number(item.quantity || 0);
              }
            }, 0);
            return sum + itemTotal;
          }, 0)
        });
      } catch (err) {
        console.error(err);
        setError(t.errorLoading);
      } finally {
        setLoading(false);
      }
  }, [t.errorLoading]);

  useEffect(() => {
    fetchTodayStats();
  }, [fetchTodayStats]);

  // Auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTodayStats(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTodayStats]);

  const summaryRows = [
    { label: t.totalVisits, value: loading ? '--' : String(stats.visits).padStart(2, '0') },
    { label: t.totalSales, value: loading ? '--' : currencyFormatter.format(stats.sales) },
    { label: t.totalItems, value: loading ? '--' : stats.items }
  ];

  return (
    <div className="space-y-5">
      <Link
        to="/sell/shop"
        className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-blue-800"
      >
        <Plus size={17} />
        <span>{t.startSelling}</span>
      </Link>

      <section className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-xs font-black text-slate-950">{t.todaySummary}</h2>
        <div className="space-y-3">
          {summaryRows.map((row) => (
            <div key={row.label} className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">{row.label}</span>
              <span className="font-black text-slate-950">{row.value}</span>
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
