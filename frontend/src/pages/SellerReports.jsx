import React, { useEffect, useMemo, useState } from 'react';
import API from '../api/axios';
import { AlertCircle, Loader2 } from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const SellerReports = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await API.get('/sales/my-records');
        setRecords(response.data);
      } catch (err) {
        console.error(err);
        setError('Reports could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const stats = useMemo(() => {
    return records.reduce(
      (total, record) => {
        const itemCount = (record.items || []).reduce((sum, item) => {
          if (item.unit === 'weight') {
            return sum + 1; // Count weight-based items as 1
          } else {
            return sum + Number(item.quantity || 0);
          }
        }, 0);
        return {
          visits: total.visits + 1,
          sales: total.sales + Number(record.totalAmount || 0),
          items: total.items + itemCount
        };
      },
      { visits: 0, sales: 0, items: 0 }
    );
  }, [records]);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="mr-2 animate-spin text-blue-700" size={22} />
        <span className="text-sm font-semibold text-slate-500">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-xs font-black text-slate-950">Sales Summary</h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Total Visits</span>
            <span className="font-black text-slate-950">{stats.visits}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Total Sales</span>
            <span className="font-black text-slate-950">{currencyFormatter.format(stats.sales)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">Total Items</span>
            <span className="font-black text-slate-950">{stats.items}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerReports;
