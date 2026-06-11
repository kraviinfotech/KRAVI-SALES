import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axios';
import SalesTable from '../components/SalesTable';
import ReportFilter from '../components/ReportFilter';
import { Loader2, User, AlertCircle } from 'lucide-react';

const ManagerSellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [sellerName, setSellerName] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    sellerId: decodeURIComponent(sellerId), // Pre-fill sellerId from URL param
    shopName: '',
    shopType: '',
    status: '',
    from: '',
    to: '',
  });

  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const response = await API.get(`/sellers/${sellerId}`);
        setSellerName(response.data.name);
      } catch (err) {
        console.error('Failed to fetch seller details:', err);
        setError('Seller details load nahi ho paaye.');
      }
    };
    fetchSellerDetails();
  }, [sellerId]);

  useEffect(() => {
    const fetchRecords = async (currentFilters) => {
      setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        Object.keys(currentFilters).forEach(key => {
          if (currentFilters[key]) {
            queryParams.append(key, currentFilters[key]);
          }
        });
        const response = await API.get(`/reports/records?${queryParams.toString()}`);
        setRecords(response.data);
      } catch (err) {
        console.error('Failed to fetch records:', err);
        setError(err.response?.data?.message || 'Records load nahi ho paaye.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords(filters);
  }, [filters, sellerId]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <div className="space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="rounded-md bg-blue-50 p-2 text-blue-700">
          <User size={22} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Seller Records</p>
          <h1 className="text-2xl font-black text-slate-950">
            {sellerName || decodeURIComponent(sellerId)}
          </h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <ReportFilter
          onFilter={handleFilterChange}
          sellers={[]} // No need for seller dropdown here, as seller is already selected
          filters={filters}
          hideSellerFilter={true} // Hide seller-specific filters
        />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg border border-gray-100">
          <Loader2 className="animate-spin text-blue-700" size={24} />
        </div>
      ) : (
        <SalesTable records={records} />
      )}
    </div>
  );
};

export default ManagerSellerDetail;
