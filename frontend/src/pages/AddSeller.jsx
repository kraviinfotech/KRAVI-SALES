import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { UserPlus, Loader2, AlertCircle, CheckCircle2, Phone, User, Lock, ListCollapse } from 'lucide-react';

const AddSeller = () => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  
  const [sellers, setSellers] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchSellers = async () => {
    try {
      const response = await API.get('/sellers');
      setSellers(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoadingSubmit(true);

    try {
      await API.post('/sellers', { name, mobile, password });
      
      setSuccess('Seller successfully created.');
      setName('');
      setMobile('');
      setPassword('');
      
      fetchSellers();
    } catch (err) {
      if (!err.response) {
        setError('Network Error: Cannot connect to the server. Is the backend running?');
      } else {
        setError(err.response.data?.message || 'Error occurred while creating seller.');
      }
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left: Add Seller Form */}
      <div className="md:col-span-1 bg-white p-6 rounded-lg border border-gray-100 shadow-sm h-fit">
        <div className="flex items-center space-x-2 mb-6">
          <UserPlus className="text-primary" size={20} />
          <h2 className="text-lg font-bold text-gray-900 font-sans">Add New Seller</h2>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 flex items-center space-x-2 text-sm font-medium border border-red-200">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 flex items-center space-x-2 text-sm font-medium border border-green-200">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loadingSubmit}
            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 rounded transition-colors flex items-center justify-center space-x-2 text-sm disabled:opacity-70 cursor-pointer shadow-sm mt-2"
          >
            {loadingSubmit ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Add Seller Representative</span>
            )}
          </button>
        </form>
      </div>

      {/* Right: Existing Sellers List */}
      <div className="md:col-span-2 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <ListCollapse className="text-gray-500" size={20} />
          <h2 className="text-lg font-bold text-gray-900 font-sans">Registered Team Members</h2>
        </div>

        {loadingList ? (
          <div className="flex justify-center py-12">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : sellers.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">
            No sales team members have been registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
                  <th className="p-3">Seller Name</th>
                  <th className="p-3">Mobile Contact</th>
                  <th className="p-3">Registered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {sellers.map((seller) => (
                  <tr key={seller._id} className="hover:bg-gray-50/55 transition-colors">
                    <td className="p-3 font-medium text-gray-900">{seller.name}</td>
                    <td className="p-3 font-mono">{seller.mobile}</td>
                    <td className="p-3 text-gray-500">
                      {new Date(seller.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddSeller;
