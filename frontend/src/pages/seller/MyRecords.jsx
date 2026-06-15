import React, { useEffect, useState } from 'react';
import API from '../../api/axios';
import { AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const MyRecords = () => {
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
        setError('Records load nahi ho paaye.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Loader2 className="mr-2 animate-spin text-blue-700" size={22} />
        <span className="text-sm font-semibold text-slate-500">Loading records...</span>
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

      {records.length === 0 ? (
        <div className="rounded-md border border-slate-200 bg-white px-4 py-10 text-center text-sm font-semibold text-slate-500">
          Abhi koi record saved nahi hai.
        </div>
      ) : (
        records.map((record) => (
          <article key={record._id} className="border-b border-slate-200 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-slate-950">{record.shopName} {record.mobile && <span className="font-normal text-slate-500">({record.mobile})</span>}</h2>
                <p className="mt-2 text-[11px] font-semibold text-slate-600">
                  {format(new Date(record.visitDatetime), 'dd MMM yyyy, hh:mm a')}
                </p>
              </div>
              <span className="shrink-0 text-sm font-black text-slate-950">
                {currencyFormatter.format(record.totalAmount || 0)}
              </span>
            </div>
          </article>
        ))
      )}
    </div>
  );
};

export default MyRecords;
