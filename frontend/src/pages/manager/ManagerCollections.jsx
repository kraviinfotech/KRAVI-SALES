import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import API from '../../api/axios';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});
const collectionsPageSize = 20;

const ManagerCollections = () => {
  const [collections, setCollections] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCollections = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get(`/shoppayments/manager-collections?page=${page}&limit=${collectionsPageSize}`);
      setCollections(res.data.collections);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Error fetching collections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections(pagination.page);
  }, [pagination.page]);

  const handlePrevPage = () => {
    if (pagination.page > 1) {
      setPagination({ ...pagination, page: pagination.page - 1 });
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      setPagination({ ...pagination, page: pagination.page + 1 });
    }
  };

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/manager')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">All Collections</h1>
            <p className="text-sm font-medium text-slate-500">View all payment records</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold text-slate-500 text-left border-b border-slate-200">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Shop</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Mode</th>
                <th className="px-6 py-4">Seller</th>
                <th className="px-6 py-4">Remarks</th>
                <th className="px-6 py-4">TXN ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Loader2 className="mx-auto animate-spin text-indigo-600" size={24} />
                  </td>
                </tr>
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 font-medium">
                    No collections found.
                  </td>
                </tr>
              ) : (
                collections.map((payment) => (
                  <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-700 whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">{payment.shopName}</td>
                    <td className="px-6 py-4 font-black text-emerald-600">
                      +{currencyFormatter.format(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        payment.mode === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {payment.mode}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{payment.sellerId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-600">{payment.remarks || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">{payment.txnId || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {!loading && collections.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 bg-slate-50">
            <p className="text-sm font-medium text-slate-600">
              Showing <span className="font-bold text-slate-900">{(pagination.page - 1) * collectionsPageSize + 1}</span> to <span className="font-bold text-slate-900">{Math.min(pagination.page * collectionsPageSize, pagination.total)}</span> of <span className="font-bold text-slate-900">{pagination.total}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={pagination.page === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-bold text-slate-700 px-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={pagination.page === pagination.pages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerCollections;
