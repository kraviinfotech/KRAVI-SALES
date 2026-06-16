import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MoreVertical, Eye, Edit2, Trash2, Download, Building } from 'lucide-react';
import API from '../../api/axios';

const Companies = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleAddCompany = () => {
    const name = window.prompt('Company name');
    if (!name) return;
    const owner = window.prompt('Owner name') || '';
    const email = window.prompt('Contact email') || '';
    const phone = window.prompt('Contact phone') || '';
    const plan = window.prompt('Plan (Basic/Professional/Enterprise)') || 'Basic';
    const expiry = window.prompt('Expiry date (YYYY-MM-DD)') || '';

    const payload = {
      name,
      ownerName: owner,
      email,
      phone,
      plan,
      expiryDate: expiry ? new Date(expiry) : undefined,
      status: 'Active'
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
    window.alert(JSON.stringify(company, null, 2));
  };

  const handleEdit = (company) => {
    if (!window.confirm(`Edit ${company.name}?`)) return;
    const name = window.prompt('Company name', company.name) || company.name;
    const owner = window.prompt('Owner name', company.ownerName || '') || company.ownerName;
    const email = window.prompt('Contact email', company.email || '') || company.email;
    const phone = window.prompt('Contact phone', company.phone || '') || company.phone;
    const plan = window.prompt('Plan', company.plan || 'Basic') || company.plan;
    const expiry = window.prompt('Expiry date (YYYY-MM-DD)', company.expiryDate ? new Date(company.expiryDate).toISOString().slice(0,10) : '') || '';

    const payload = {
      name,
      ownerName: owner,
      email,
      phone,
      plan,
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
  
  const tabs = ['All', 'Active', 'Expired', 'Trial'];
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get('/companies')
      .then(res => setCompanies(res.data))
      .catch(err => console.error('Failed to load companies', err))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Expired': return 'bg-red-100 text-red-700';
      case 'Trial': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Company Management</h1>
        <button onClick={handleAddCompany} className="bg-[#6C3EF4] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#5a32cc] transition-all flex items-center gap-2">
          + Add Company
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search companies..." className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#6C3EF4] rounded-xl transition-all outline-none" />
          </div>
          <button className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-100">
            <Filter size={18} />
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="date" className="pl-10 pr-3 py-2 bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-[#6C3EF4] rounded-lg transition-all outline-none" />
          </div>
          <button className="px-3 py-2 bg-[#6C3EF4] text-white rounded-lg text-sm font-medium hover:bg-[#5a32cc] transition-all">
            Apply
          </button>
        </div>

        <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-[#6C3EF4] shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-sm text-gray-600 border border-gray-100">
          <Calendar size={16} />
          <span>Select Date Range</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Company Name</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Email / Phone</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Expiry Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-4">Loading...</td></tr>
              ) : companies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-gray-800">{company.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.ownerName || company.owner}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-800 font-medium">{company.email}</div>
                    <div className="text-xs text-gray-500">{company.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-[#6C3EF4]">{company.plan}</span>
                    <div className="text-xs text-gray-400">Since {company.startDate ? new Date(company.startDate).toLocaleDateString() : ''}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{company.expiryDate ? new Date(company.expiryDate).toLocaleDateString() : ''}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(company.status)}`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleView(company)} className="p-2 hover:bg-purple-50 text-[#6C3EF4] rounded-lg transition-colors"><Eye size={18} /></button>
                      <button onClick={() => handleEdit(company)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(company)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"><Trash2 size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Companies;