import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MoreVertical, Eye, Edit2, Trash2, Download, Building, X, Upload } from 'lucide-react';
import API from '../../api/axios';

const tabs = ['All', 'Active', 'Expired', 'Trial'];

const Companies = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setLoading(true);
    API.get('/companies')
      .then(res => setCompanies(res.data))
      .catch(err => console.error('Failed to load companies', err))
      .finally(() => setLoading(false));
  }, []);

  const handleAddCompany = () => {
    const name = window.prompt('Company name');
    if (!name) return;
    const ownerName = window.prompt('Owner name') || '';
    const email = window.prompt('Contact email') || '';
    const phone = window.prompt('Contact phone') || '';
    const gstNumber = window.prompt('GST Number') || '';
    const address = window.prompt('Address') || '';
    const plan = window.prompt('Plan (Basic/Professional/Enterprise)') || 'Basic';
    const managerCount = parseInt(window.prompt('Manager Count', '0') || '0');
    const expiry = window.prompt('Expiry date (YYYY-MM-DD)') || '';

    const payload = {
      name,
      ownerName,
      email,
      phone,
      gstNumber,
      address,
      plan,
      managerCount,
      expiryDate: expiry ? new Date(expiry) : undefined,
      status: 'Active',
      subscriptionDetails: {
        users: 0,
        activeUsers: 0,
        storage: '0 GB',
        features: []
      }
    };

    API.post('/companies', payload)
      .then(res => {
        setCompanies(prev => [res.data, ...prev]);
      })
      .catch(err => {
        console.error(err);
        window.alert('Failed to create company');
      });
  };

  const handleView = (company) => {
    setSelectedCompany(company);
    setShowDetailDrawer(true);
  };

  const handleEdit = (company) => {
    if (!window.confirm(`Edit ${company.name}?`)) return;
    const name = window.prompt('Company name', company.name) || company.name;
    const ownerName = window.prompt('Owner name', company.ownerName || '') || company.ownerName;
    const email = window.prompt('Contact email', company.email || '') || company.email;
    const phone = window.prompt('Contact phone', company.phone || '') || company.phone;
    const gstNumber = window.prompt('GST Number', company.gstNumber || '') || company.gstNumber;
    const address = window.prompt('Address', company.address || '') || company.address;
    const plan = window.prompt('Plan', company.plan || 'Basic') || company.plan;
    const managerCount = parseInt(window.prompt('Manager Count', company.managerCount || '0') || '0');
    const expiry = window.prompt('Expiry date (YYYY-MM-DD)', company.expiryDate ? new Date(company.expiryDate).toISOString().slice(0,10) : '') || '';

    const payload = {
      name,
      ownerName,
      email,
      phone,
      gstNumber,
      address,
      plan,
      managerCount,
      expiryDate: expiry ? new Date(expiry) : undefined
    };

    API.patch(`/companies/${company._id || company.id}`, payload)
      .then(res => {
        setCompanies(prev => prev.map(c => (c._id === res.data._id ? res.data : c)));
      })
      .catch(err => {
        console.error(err);
        window.alert('Failed to update company');
      });
  };

  const handleDelete = (company) => {
    if (window.confirm(`Delete ${company.name}? This cannot be undone.`)) {
      API.delete(`/companies/${company._id || company.id}`)
        .then(() => {
          setCompanies(prev => prev.filter(c => (c._id || c.id) !== (company._id || company.id)));
        })
        .catch(err => {
          console.error(err);
          window.alert('Failed to delete company');
        });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Trial': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCompanies = companies.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Company Management</h1>
        <button type="button" onClick={handleAddCompany} className="bg-[#6C3EF4] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#5a32cc] transition-all flex items-center gap-2">
          + Add Company
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search companies..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#6C3EF4] rounded-xl transition-all outline-none" 
            />
          </div>
          <button type="button" className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-100">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" className="pl-10 pr-3 py-2 bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#6C3EF4] rounded-lg transition-all outline-none" />
          </div>
          <button type="button" className="px-3 py-2 bg-[#6C3EF4] text-white rounded-lg text-sm font-medium hover:bg-[#5a32cc] transition-all">
            Apply
          </button>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          {tabs.map(tab => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-[#6C3EF4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Logo</th>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Email / Phone</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Managers</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500">Loading...</td></tr>
              ) : filteredCompanies.length === 0 ? (
                <tr><td colSpan={9} className="px-6 py-4 text-center text-gray-500">No companies found</td></tr>
              ) : filteredCompanies.map((company) => (
                <tr key={company._id || company.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Building size={20} className="text-purple-600" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{company.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.ownerName || '-'}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800 font-medium">{company.email || '-'}</div>
                    <div className="text-xs text-gray-500">{company.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#6C3EF4]">{company.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.managerCount || 0}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.expiryDate ? new Date(company.expiryDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(company.status)}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => handleView(company)} className="p-2 hover:bg-purple-50 text-[#6C3EF4] rounded-lg transition-colors" title="View"><Eye size={18} /></button>
                      <button type="button" onClick={() => handleEdit(company)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" title="Edit"><Edit2 size={18} /></button>
                      <button type="button" onClick={() => handleDelete(company)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Delete"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {showDetailDrawer && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full overflow-y-auto shadow-2xl">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#6C3EF4] to-purple-600 text-white p-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">Company Details</h2>
                <p className="text-purple-100 text-sm">{selectedCompany.name}</p>
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
              {/* Company Logo Section */}
              <div className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                {selectedCompany.logo ? (
                  <img src={selectedCompany.logo} alt={selectedCompany.name} className="w-24 h-24 rounded-lg object-cover mx-auto mb-4" />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <Building size={48} className="text-purple-600" />
                  </div>
                )}
                <p className="text-sm text-gray-500">Company Logo</p>
              </div>

              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Company Information</h3>
                
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Company Name</p>
                    <p className="text-gray-800 font-semibold">{selectedCompany.name}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Owner Name</p>
                    <p className="text-gray-800 font-semibold">{selectedCompany.ownerName || '-'}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">GST Number</p>
                    <p className="text-gray-800 font-semibold">{selectedCompany.gstNumber || '-'}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Address</p>
                    <p className="text-gray-800 font-semibold">{selectedCompany.address || '-'}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium uppercase">Email</p>
                      <p className="text-gray-800 font-semibold text-sm">{selectedCompany.email || '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium uppercase">Phone</p>
                      <p className="text-gray-800 font-semibold text-sm">{selectedCompany.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Subscription Details</h3>
                
                <div className="space-y-3">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium uppercase">Plan Type</p>
                    <p className="text-blue-900 font-semibold text-lg">{selectedCompany.plan}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium uppercase">Start Date</p>
                      <p className="text-gray-800 font-semibold">{selectedCompany.startDate ? new Date(selectedCompany.startDate).toLocaleDateString() : '-'}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p className="text-xs text-gray-500 font-medium uppercase">Expiry Date</p>
                      <p className="text-gray-800 font-semibold">{selectedCompany.expiryDate ? new Date(selectedCompany.expiryDate).toLocaleDateString() : '-'}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Total Users</p>
                    <p className="text-gray-800 font-semibold">{selectedCompany.subscriptionDetails?.users || 0}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Active Users</p>
                    <p className="text-gray-800 font-semibold">{selectedCompany.subscriptionDetails?.activeUsers || 0}</p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium uppercase">Storage Used</p>
                    <p className="text-gray-800 font-semibold">{selectedCompany.subscriptionDetails?.storage || '0 GB'}</p>
                  </div>
                </div>
              </div>

              {/* Manager Count */}
              <div className="space-y-4">
                <h3 className="font-bold text-gray-800 text-lg">Team Details</h3>
                
                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                  <p className="text-xs text-green-600 font-medium uppercase">Manager Count</p>
                  <p className="text-green-900 font-semibold text-2xl">{selectedCompany.managerCount || 0}</p>
                </div>
              </div>

              {/* Status Section */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 font-medium uppercase mb-2">Status</p>
                <span className={`px-3 py-2 rounded-lg text-sm font-bold ${getStatusColor(selectedCompany.status)} inline-block`}>
                  {selectedCompany.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
