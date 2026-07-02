import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit2, Trash2, Lock, CheckCircle2, XCircle, Users, User, Mail, Phone, Award, X, RotateCcw } from 'lucide-react';
import API from '../../api/axios';

const Managers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedManager, setSelectedManager] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    loadManagers();
  }, []);

  const loadManagers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/managers');
      setManagers(res.data);
    } catch (err) {
      console.error('Failed to load managers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddManager = () => {
    window.location.href = '/admin/add-manager';
  };

  const handleView = (manager) => {
    setSelectedManager(manager);
    setShowDetailDrawer(true);
  };

  const handleEdit = (manager) => {
    const newName = window.prompt('Name', manager.name) || manager.name;
    const newDesignation = window.prompt('Designation', manager.designation || 'Manager') || manager.designation;
    const newEmail = window.prompt('Email', manager.email) || manager.email;
    const newPhone = window.prompt('Phone', manager.mobile) || manager.mobile;

    const payload = {
      name: newName,
      email: newEmail,
      mobile: newPhone,
      designation: newDesignation
    };

    API.patch(`/admin/managers/${manager._id}`, payload)
      .then(() => {
        setManagers(prev => prev.map(m => 
          m._id === manager._id ? { ...m, ...payload } : m
        ));
        if (selectedManager?._id === manager._id) {
          setSelectedManager({ ...selectedManager, ...payload });
        }
      })
      .catch(err => {
        console.error(err);
        alert('Failed to update manager');
      });
  };

  const handleResetPassword = (manager) => {
    setResetEmail(manager.email);
    setShowResetPassword(true);
  };

  const confirmResetPassword = async () => {
    try {
      await API.post('/admin/reset-manager-password', { email: resetEmail });
      alert('Password reset link sent to ' + resetEmail);
      setShowResetPassword(false);
      setResetEmail('');
    } catch (err) {
      console.error(err);
      alert('Failed to reset password');
    }
  };

  const handleToggleActive = (manager) => {
    const newStatus = !manager.isActive;
    if (!window.confirm(`${newStatus ? 'Activate' : 'Deactivate'} ${manager.name}?`)) return;

    API.patch(`/admin/managers/${manager._id}`, { isActive: newStatus })
      .then(() => {
        setManagers(prev => prev.map(m => 
          m._id === manager._id ? { ...m, isActive: newStatus } : m
        ));
        if (selectedManager?._id === manager._id) {
          setSelectedManager({ ...selectedManager, isActive: newStatus });
        }
      })
      .catch(err => {
        console.error(err);
        alert('Failed to update manager status');
      });
  };

  const handleDelete = (manager) => {
    if (!window.confirm(`Delete ${manager.name}? This cannot be undone.`)) return;

    API.delete(`/admin/managers/${manager._id}`)
      .then(() => {
        setManagers(prev => prev.filter(m => m._id !== manager._id));
        setShowDetailDrawer(false);
      })
      .catch(err => {
        console.error(err);
        alert('Failed to delete manager');
      });
  };

  const filteredManagers = managers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.mobile.includes(searchTerm)
  );

  const totalManagers = managers.length;
  const activeManagers = managers.filter(m => m.isActive).length;
  const inactiveManagers = managers.filter(m => !m.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Manager Management</h1>
        <button
          type="button"
          onClick={handleAddManager}
          className="bg-[#6C3EF4] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#5a32cc] transition-all flex items-center gap-2"
        >
          + Add Manager
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-purple-50 text-[#6C3EF4]">
              <Users size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Total Managers</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{totalManagers}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <CheckCircle2 size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Active Managers</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{activeManagers}</h3>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <XCircle size={24} />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium">Inactive Managers</p>
          <h3 className="text-3xl font-bold text-gray-800 mt-1">{inactiveManagers}</h3>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#6C3EF4] rounded-xl transition-all outline-none"
            />
          </div>
          <button type="button" className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-100">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Managers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Photo</th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Phone</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : filteredManagers.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-4 text-center text-gray-500">No managers found</td></tr>
              ) : filteredManagers.map((manager) => (
                <tr key={manager._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    {manager.photo || manager.managerScannerPhoto ? (
                      <img 
                        src={manager.photo || manager.managerScannerPhoto} 
                        alt={manager.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <User size={20} className="text-purple-600" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{manager.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{manager.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{manager.mobile}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{manager.designation || 'Manager'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      manager.isActive 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {manager.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(manager)}
                        className="p-2 hover:bg-purple-50 text-[#6C3EF4] rounded-lg transition-colors"
                        title="View Profile"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(manager)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleResetPassword(manager)}
                        className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <RotateCcw size={18} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(manager)}
                        className={`p-2 rounded-lg transition-colors ${
                          manager.isActive 
                            ? 'hover:bg-red-50 text-red-500' 
                            : 'hover:bg-green-50 text-green-600'
                        }`}
                        title={manager.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {manager.isActive ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {showDetailDrawer && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#6C3EF4] to-purple-600 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Manager Profile</h2>
                <p className="text-purple-100 text-sm">{selectedManager.designation || 'Manager'}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailDrawer(false)}
                className="text-white hover:bg-white hover:text-[#6C3EF4] p-2 rounded-lg transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-6 space-y-6">
              {/* Photo Section */}
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                {selectedManager.photo || selectedManager.managerScannerPhoto ? (
                  <img 
                    src={selectedManager.photo || selectedManager.managerScannerPhoto} 
                    alt={selectedManager.name} 
                    className="w-24 h-24 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <User size={48} className="text-purple-600" />
                  </div>
                )}
                <p className="text-sm text-gray-500">Manager Photo</p>
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Basic Information</h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Full Name</p>
                    <p className="text-gray-800 font-semibold">{selectedManager.name}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Designation</p>
                    <p className="text-gray-800 font-semibold">{selectedManager.designation || 'Manager'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                      <p className="text-gray-800 font-semibold text-sm break-all">{selectedManager.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                      <p className="text-gray-800 font-semibold text-sm">{selectedManager.mobile}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Account Status</h3>
                
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium uppercase mb-2">Status</p>
                  <span className={`px-3 py-2 rounded-lg text-sm font-bold ${
                    selectedManager.isActive 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  } inline-block`}>
                    {selectedManager.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 font-medium uppercase">Joined Date</p>
                  <p className="text-gray-800 font-semibold">{new Date(selectedManager.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    handleEdit(selectedManager);
                    setShowDetailDrawer(false);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} /> Edit Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleResetPassword(selectedManager);
                    setShowDetailDrawer(false);
                  }}
                  className="w-full bg-orange-600 text-white py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={18} /> Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleToggleActive(selectedManager);
                    setShowDetailDrawer(false);
                  }}
                  className={`w-full py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    selectedManager.isActive 
                      ? 'bg-red-600 text-white hover:bg-red-700' 
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {selectedManager.isActive ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                  {selectedManager.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDelete(selectedManager);
                  }}
                  className="w-full bg-red-600 text-white py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} /> Delete Manager
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-orange-100 rounded-full mb-4">
              <RotateCcw size={24} className="text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Reset Password</h2>
            <p className="text-gray-600 text-center mb-6">
              A password reset link will be sent to <span className="font-semibold">{resetEmail}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowResetPassword(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmResetPassword}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
              >
                Send Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Managers;
