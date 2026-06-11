import React, { useState } from 'react';
import { Search, RotateCcw, Download } from 'lucide-react';

/**
 * Filter component for Manager Records page.
 * Provides dropdowns and inputs for seller, shop type, status, dates, and search fields.
 */
const ManagerReportFilter = ({ onFilter, onDownloadCSV, sellers = [] }) => {
  const [sellerId, setSellerId] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopType, setShopType] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleApply = (e) => {
    e.preventDefault();
    onFilter({ sellerId, sellerName, shopName, shopType, status, from, to });
  };

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
    <form onSubmit={handleApply} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {/* Seller Dropdown */}
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
        {/* Seller Name Search */}
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
        {/* Shop Name Search */}
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
        {/* Shop Type */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Shop Type</label>
          <select
            value={shopType}
            onChange={(e) => setShopType(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Types</option>
            <option value="General Store">General Store</option>
            <option value="Medical">Medical</option>
            <option value="Grocery">Grocery</option>
            <option value="Electronics">Electronics</option>
          </select>
        </div>
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        {/* From Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">From Date</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        {/* To Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">To Date</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-gray-100 gap-2">
        <div className="flex space-x-2">
          <button type="submit" className="flex items-center space-x-1.5 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            <Search size={16} />
            <span>Apply Filters</span>
          </button>
          <button type="button" onClick={handleClear} className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition-colors">
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
        {onDownloadCSV && (
          <button type="button" onClick={onDownloadCSV} className="flex items-center space-x-1.5 bg-success hover:bg-emerald-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            <Download size={16} />
            <span>Download CSV</span>
          </button>
        )}
      </div>
    </form>
  );
};

export default ManagerReportFilter;
