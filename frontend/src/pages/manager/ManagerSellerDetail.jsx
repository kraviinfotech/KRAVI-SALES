import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import SalesTable from '../../components/SalesTable';
import ReportFilter from '../../components/ReportFilter';
import { Loader2, User, AlertCircle } from 'lucide-react';

const ManagerSellerDetail = () => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [sellerName, setSellerName] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // FIXED: Pre-compute the target identifier cleanly to avoid reactive effect synchronization cascades
  const decodedSellerId = decodeURIComponent(sellerId);

  const [filters, setFilters] = useState({
    sellerId: decodedSellerId,
    shopName: '',
    shopType: '',
    status: '',
    from: '',
    to: '',
  });

  // Fetch static seller details clean on initialization or mount
  useEffect(() => {
    const fetchSellerDetails = async () => {
      try {
        const response = await API.get(`/sellers/${sellerId}`);
        setSellerName(response.data.name);
      } catch (err) {
        console.error('Failed to fetch seller details:', err);
        setError('Seller details could not be loaded.');
      }
    };
    
    fetchSellerDetails();
  }, [sellerId]);

  // FIXED: Single declarative side-effect data fetch handling filter updates seamlessly
  useEffect(() => {
    const fetchRecords = async () => {
      if (!sellerId) return;
      
      if (records.length === 0) setLoading(true);
      setError('');
      try {
        const queryParams = new URLSearchParams();
        
        // Always enforce active URL state seller token mapping explicitly
        const currentFilters = { ...filters, sellerId: decodedSellerId };

        Object.keys(currentFilters).forEach(key => {
          if (currentFilters[key]) {
            queryParams.append(key, currentFilters[key]);
          }
        });
        const response = await API.get(`/reports/records?${queryParams.toString()}`);
        setRecords(response.data);
      } catch (err) {
        console.error('Failed to fetch records:', err);
        setError(err.response?.data?.message || 'Records could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [filters, sellerId, decodedSellerId]);

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
            {sellerName || decodedSellerId}
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
          sellers={[]} 
          filters={filters}
          hideSellerFilter={true} 
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