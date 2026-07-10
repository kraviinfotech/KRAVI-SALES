import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../api/axios';
import SalesTable from '../../components/SalesTable';
import { Loader2, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import RecordsHeader from './components/RecordsHeader';
import RecordsSummaryCards from './components/RecordsSummaryCards';
import RecordsToolbar from './components/RecordsToolbar';
import { exportManagerRecordsPDF, exportRecordsCSV } from '../../utils/recordsExport';

const handlePrint = () => {
  window.print();
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const ManagerRecords = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [records, setRecords] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Initialize filters from URL search params
  const filters = {
    sellerId: searchParams.get('sellerId') || '',
    sellerName: searchParams.get('sellerName') || '',
    shopName: searchParams.get('shopName') || '',
    shopType: searchParams.get('shopType') || '',
    status: searchParams.get('status') || '',
    from: searchParams.get('from') || '',
    to: searchParams.get('to') || ''
  };

  // Load sellers for filter dropdown
  useEffect(() => {
    const fetchSellers = async () => {
      try {
        const response = await API.get('/sellers');
        setSellers(response.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSellers();
  }, []);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get(`/reports/records?${searchParams.toString()}`);
      setRecords(Array.isArray(response.data) ? response.data : []);
      setErrorMsg('');
    } catch (err) {
      console.error("Error fetching records:", err);
      if (err.response?.status === 403) {
        setErrorMsg('Access Denied: You are not authorized to view these records. Please login as a Manager.');
      } else {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to load records');
      }
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // FIXED: Derive the values on the fly during rendering loop with useMemo instead of copying to state
  const summary = useMemo(() => {
    const total = records.length;
    const active = records.filter(r => r.paymentStatus === 'Paid').length;
    const inactive = records.filter(r => r.paymentStatus !== 'Paid').length;
    const newThisMonth = records.filter(r => {
      const date = new Date(r.visitDatetime);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const totalPending = records.reduce((sum, r) => sum + Number(r.pendingAmount || 0), 0);

    return { total, active, inactive, newThisMonth, totalPending };
  }, [records]);

  const handleFilterChange = (newFilters) => {
    const params = {};
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) params[key] = newFilters[key];
    });
    setSearchParams(params);
  };

  const handleDownloadCSV = () => exportRecordsCSV(records, 'manager_records');

  const handleExportExcel = () => {
    alert('Excel export is not yet implemented. CSV will be exported instead.');
    handleDownloadCSV();
  };

  const handleExportPDF = () => exportManagerRecordsPDF(records, user?.name);

  const handleAddNew = () => {
    navigate('/manager/records/new');
  };

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl space-y-4 bg-slate-50/50 p-3 sm:space-y-6 sm:p-5 lg:p-8">
      <RecordsHeader onAddNew={handleAddNew} />

      {/* Summary Cards */}
      <RecordsSummaryCards summary={summary} loading={loading} currencyFormatter={currencyFormatter} />

      {/* Toolbar: Search, Filters & Exports */}
      <RecordsToolbar
        filters={filters}
        onFilterChange={handleFilterChange}
        sellers={sellers}
        onSearch={handleFilterChange}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
        onPrint={handlePrint}
        onDownloadCSV={handleDownloadCSV}
      />

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium" role="alert">
          <XCircle size={18} />
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg border border-gray-100">
          <Loader2 className="animate-spin text-primary" size={24} />
        </div>
      ) : (
        <SalesTable records={records} />
      )}
    </div>
  );
};

export default ManagerRecords;