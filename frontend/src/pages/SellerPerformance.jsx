import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { Loader2, ArrowUpDown, Award, AlertCircle } from 'lucide-react';

const SellerPerformance = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [sortField, setSortField] = useState('totalSales');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const response = await API.get('/reports/sellers-performance');
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch seller performance stats.');
      } finally {
        setLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (typeof valA === 'string') {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-primary mr-2" size={32} />
        <span className="text-gray-500 font-medium">Loading performance metrics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Award className="text-yellow-500" size={24} />
        <h2 className="text-xl font-bold text-gray-900 font-sans">Seller Performance Leaderboard</h2>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm border border-red-200">
          <AlertCircle size={18} className="inline mr-2 animate-pulse" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-xs font-semibold uppercase tracking-wider border-b border-gray-150">
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center space-x-1">
                    <span>Seller Name</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors text-center" onClick={() => handleSort('recordCount')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Shops Visited</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 cursor-pointer hover:bg-gray-100 transition-colors text-center" onClick={() => handleSort('itemsSold')}>
                  <div className="flex items-center justify-center space-x-1">
                    <span>Items Sold</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">
                    No active sellers onboarded yet.
                  </td>
                </tr>
              ) : (
                sortedData.map((seller, idx) => (
                  <tr key={seller.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-900 flex items-center space-x-3">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        idx === 0 ? 'bg-yellow-100 text-yellow-800' :
                        idx === 1 ? 'bg-gray-100 text-gray-800' :
                        idx === 2 ? 'bg-orange-100 text-orange-850' :
                        'bg-blue-50 text-primary'
                      }`}>
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{seller.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{seller.mobile}</p>
                      </div>
                    </td>
                    <td className="p-4 text-center text-gray-700 font-medium">
                      {seller.shopsVisited}
                    </td>
                    <td className="p-4 text-center text-gray-700 font-medium">
                      {seller.itemsSold}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SellerPerformance;
