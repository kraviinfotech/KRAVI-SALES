import React, { useState, useEffect } from 'react';
import { Search, RotateCcw, Download } from 'lucide-react';

const ReportFilter = ({ onFilter, onDownloadCSV, sellers = [], filters = {} }) => {
  const [sellerId, setSellerId] = useState(filters.sellerId || '');
  const [sellerName, setSellerName] = useState(filters.sellerName || '');
  const [shopName, setShopName] = useState(filters.shopName || '');
  const [shopType, setShopType] = useState(filters.shopType || '');
  const [status, setStatus] = useState(filters.status || '');
  const [from, setFrom] = useState(filters.from || '');
  const [to, setTo] = useState(filters.to || '');

  // Sync internal state with parent filters (like the external search bar)
  useEffect(() => {
    setSellerId(filters.sellerId || '');
    setSellerName(filters.sellerName || '');
    setShopName(filters.shopName || '');
    setShopType(filters.shopType || '');
    setStatus(filters.status || '');
    setFrom(filters.from || '');
    setTo(filters.to || '');
  }, [filters]);

  // Auto-apply filters whenever any state changes (with 500ms debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilter({ sellerId, sellerName, shopName, shopType, status, from, to });
    }, 500);

    return () => clearTimeout(timer);
  }, [sellerId, sellerName, shopName, shopType, status, from, to, onFilter]);

  const handleClear = () => {
    setSellerId('');
    setSellerName('');
    setShopName('');
    setShopType('');
    setStatus('');
    setFrom('');
    setTo('');
    onFilter({ sellerId: '', sellerName: '', shopName: '', shopType: '', status: '', from: '', to: '' });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
      <div className="flex flex-nowrap overflow-x-auto items-end gap-4 pb-2">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Seller</label>
          <select
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Sellers</option>
            {sellers.map((seller) => (
              <option key={seller._id} value={seller._id}>
                {seller.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Seller Name</label>
          <input
            type="text"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Shop Name</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Search..."
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Shop Type</label>
          <select
            value={shopType}
            onChange={(e) => setShopType(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Types</option>
            <option value="Retail">Retail</option>
            <option value="Wholesale">Wholesale</option>
            <option value="Distributor">Distributor</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        {/* Reset button in same row */}
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors whitespace-nowrap"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>
      </div>
      {onDownloadCSV && (
        <div className="flex justify-end mt-3">
          <button
            type="button"
            onClick={onDownloadCSV}
            className="flex items-center space-x-1.5 bg-success hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
          >
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportFilter;
