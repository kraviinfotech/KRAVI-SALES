import React, { useState, useEffect } from 'react';
import { Check, Edit3, Trash2, IndianRupee, Layers, Filter } from 'lucide-react';
import API from '../../api/axios';

const PlanCard = ({ name, price, duration, managers, storage, features, isActive, onEdit, onDelete }) => {
  const handleEdit = () => {
    if (window.confirm(`Edit "${name}"?`)) {
      onEdit();
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete plan "${name}"? This cannot be undone.`)) {
      onDelete();
    }
  };

  return (
    <div className={`bg-white rounded-3xl border-2 p-8 transition-all hover:shadow-xl ${isActive ? 'border-[#6C3EF4]' : 'border-gray-100'}`}>
    <div className="flex justify-between items-start mb-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-black text-gray-900">₹{price}</span>
          <span className="text-gray-500 text-sm font-medium">/{duration}</span>
        </div>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-purple-100 text-[#6C3EF4]' : 'bg-gray-100 text-gray-500'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </div>
    </div>

    <div className="space-y-4 mb-8">
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-[#6C3EF4]"><Check size={12} /></div>
        Max {managers} Managers
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-[#6C3EF4]"><Check size={12} /></div>
        {storage} GB Storage
      </div>
      {features.map((f, i) => (
        <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
          <div className="w-5 h-5 rounded-full bg-purple-50 flex items-center justify-center text-[#6C3EF4]"><Check size={12} /></div>
          {f}
        </div>
      ))}
    </div>

    <div className="flex gap-2 pt-6 border-t border-gray-50">
      <button onClick={handleEdit} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all text-sm">
        <Edit3 size={16} /> Edit
      </button>
      <button onClick={handleDelete} className="px-4 py-2.5 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all">
        <Trash2 size={16} />
      </button>
    </div>
  </div>
  );
};

const Plans = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get('/plans')
      .then(res => setPlans(res.data))
      .catch(err => console.error('Failed to load plans', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlans = activeFilter === 'All' ? plans : plans.filter(p => {
    if (activeFilter === '3months') return p.durationMonths === 3;
    if (activeFilter === '6months') return p.durationMonths === 6;
    if (activeFilter === '1year') return p.durationMonths === 12;
    return true;
  });

  const handleCreatePlan = () => {
    const name = window.prompt('Plan name');
    if (!name) return;
    const price = Number(window.prompt('Price (number)', '0') || 0);
    const durationMonths = Number(window.prompt('Duration months', '3') || 3);
    const managers = window.prompt('Managers limit', '5') || '5';
    const storageGb = Number(window.prompt('Storage GB', '2') || 2);
    const features = (window.prompt('Comma separated features', '') || '').split(',').map(f => f.trim()).filter(Boolean);

    const payload = { name, price, durationMonths, managers, storageGb, features, isActive: true };
    API.post('/plans', payload)
      .then(res => setPlans(prev => [res.data, ...prev]))
      .catch(err => {
        console.error(err);
        window.alert('Failed to create plan');
      });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
          <p className="text-gray-500 mt-1">Manage and configure your service tiers</p>
        </div>
        <button onClick={handleCreatePlan} className="bg-[#6C3EF4] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#5a32cc] transition-all flex items-center gap-2 shadow-lg shadow-purple-100">
          <Layers size={20} /> Create New Plan
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={18} className="text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {['All', '3months', '6months', '1year'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-[#6C3EF4] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {filter === 'All' ? 'All Plans' : filter === '3months' ? '3 Months' : filter === '6months' ? '6 Months' : '1 Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? <div>Loading plans...</div> : filteredPlans.map((plan) => (
          <PlanCard
            key={plan._id}
            name={plan.name}
            price={plan.price}
            duration={`${plan.durationMonths} Months`}
            managers={plan.managers}
            storage={plan.storageGb}
            features={plan.features || []}
            isActive={plan.isActive}
            onEdit={() => {
              const name = window.prompt('Plan name', plan.name) || plan.name;
              const price = Number(window.prompt('Price (number)', plan.price) || plan.price);
              const durationMonths = Number(window.prompt('Duration months', plan.durationMonths) || plan.durationMonths);
              const managers = window.prompt('Managers limit', plan.managers) || plan.managers;
              const storageGb = Number(window.prompt('Storage GB', plan.storageGb) || plan.storageGb);
              const features = (window.prompt('Comma separated features', (plan.features || []).join(', ')) || '').split(',').map(f => f.trim()).filter(Boolean);

              API.patch(`/plans/${plan._id}`, { name, price, durationMonths, managers, storageGb, features })
                .then(res => {
                  setPlans(prev => prev.map(p => p._id === res.data._id ? res.data : p));
                })
                .catch(err => {
                  console.error(err);
                  window.alert('Failed to update plan');
                });
            }}
            onDelete={() => {
              API.delete(`/plans/${plan._id}`)
                .then(() => {
                  setPlans(prev => prev.filter(p => p._id !== plan._id));
                })
                .catch(err => {
                  console.error(err);
                  window.alert('Failed to delete plan');
                });
            }}
          />
        ))}
      </div>

      {/* Add Plan Preview/Form Placeholder */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
          <Layers size={32} />
        </div>
        <h3 className="text-lg font-bold text-gray-700">Need a custom plan?</h3>
        <p className="text-gray-500 max-w-xs mx-auto mt-2">You can create custom packages for specific enterprise requirements.</p>
        <button className="mt-6 text-[#6C3EF4] font-bold hover:underline">
          Open Plan Creator
        </button>
      </div>
    </div>
  );
};

export default Plans;