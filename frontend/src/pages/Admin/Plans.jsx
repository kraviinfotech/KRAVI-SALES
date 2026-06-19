import React, { useEffect, useState } from 'react';
import { Check, Crown, Edit3, Filter, Layers, Trash2 } from 'lucide-react';
import API from '../../api/axios';

const durationLabel = (plan) => {
  const days = Number(plan.durationDays || 0);
  if (days > 0) return `${days} Days`;
  return `${Number(plan.durationMonths || 0)} Months`;
};

const PlanCard = ({ plan, onEdit, onDelete }) => {
  const sellerLimit = Number(plan.maxSellers || plan.managers || 0);
  const isRecommended = plan.isRecommended || Number(plan.durationMonths) === 3 || Number(plan.durationDays) === 90 || plan.name?.toLowerCase().includes('3 month') || plan.name?.toLowerCase().includes('3-month');
  const pricingLabel = Number(plan.durationMonths) === 12 ? '/year' : Number(plan.durationMonths) > 0 ? '/month' : plan.durationDays ? '/plan' : '/plan';

  return (
    <div className={`group relative flex min-h-[440px] flex-col overflow-visible rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${isRecommended ? 'ring-1 ring-violet-100' : ''}`}>
      {isRecommended && (
        <div className="absolute right-4 top-0 z-10 -translate-y-1/2 flex items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-violet-700 shadow-sm shadow-violet-900/10">
          <Crown size={14} className="text-amber-400" />
          Recommended
        </div>
      )}
      <div className="relative rounded-t-[1.75rem] border-b border-slate-200 bg-white px-6 py-7 text-slate-900">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-black tracking-tight text-slate-950">{plan.name}</h3>
            <p className="mt-2 text-sm text-slate-500">{durationLabel(plan)} access with premium features</p>
          </div>
          <div className="text-slate-400">
            <Crown size={28} />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black text-slate-950">Rs. {Number(plan.price || 0).toLocaleString('en-IN')}</span>
            <span className="pb-1 text-sm font-semibold text-slate-500">{pricingLabel}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">Use this plan across sellers, reports, and manager tools.</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.isActive ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
          {plan.isTrial && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Free Trial</span>}
        </div>

        <div className="space-y-4 text-sm text-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-700"><Check size={16} /></div>
            <span>Max {sellerLimit > 0 ? sellerLimit : 'Unlimited'} Sellers</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-700"><Check size={16} /></div>
            <span>{plan.storageGb || 0} GB Storage</span>
          </div>
          {(plan.features || []).map((feature) => (
            <div key={feature} className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-50 text-violet-700 mt-1"><Check size={16} /></div>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-b-[1.75rem] border-t border-slate-200 bg-slate-50 px-6 py-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <button onClick={onEdit} className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-violet-700 shadow-sm transition hover:bg-violet-50">
            Edit Plan
          </button>
          <button onClick={onDelete} className="rounded-full bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const Plans = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPlans = () => {
    setLoading(true);
    API.get('/plans')
      .then(res => setPlans(res.data))
      .catch(err => console.error('Failed to load plans', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const filteredPlans = activeFilter === 'All' ? plans : plans.filter(plan => {
    if (activeFilter === 'trial') return plan.isTrial || Number(plan.price) === 0;
    if (activeFilter === '3months') return Number(plan.durationMonths) === 3;
    if (activeFilter === '6months') return Number(plan.durationMonths) === 6;
    if (activeFilter === '1year') return Number(plan.durationMonths) === 12;
    return true;
  });

  const buildPlanPayload = (plan = {}) => {
    const name = window.prompt('Plan name', plan.name || '');
    if (!name) return null;
    const price = Number(window.prompt('Price (number)', plan.price ?? '0') || 0);
    const durationMonths = Number(window.prompt('Duration months', plan.durationMonths ?? (price === 0 ? 0 : 3)) || 0);
    const durationDays = Number(window.prompt('Duration days', plan.durationDays ?? (price === 0 ? 14 : durationMonths * 30)) || 0);
    const maxSellers = Number(window.prompt('Seller limit (0 for unlimited)', plan.maxSellers ?? plan.managers ?? 5) || 0);
    const storageGb = Number(window.prompt('Storage GB', plan.storageGb ?? 2) || 2);
    const features = (window.prompt('Comma separated features', (plan.features || []).join(', ')) || '')
      .split(',')
      .map(feature => feature.trim())
      .filter(Boolean);
    const isTrial = window.confirm('Mark this as the free trial plan? Click OK for yes, Cancel for no.');

    return {
      name,
      price,
      durationMonths,
      durationDays,
      managers: String(maxSellers),
      maxSellers,
      storageGb,
      features,
      isTrial,
      isActive: plan.isActive ?? true
    };
  };

  const handleCreatePlan = () => {
    const payload = buildPlanPayload();
    if (!payload) return;

    API.post('/plans', payload)
      .then(res => setPlans(prev => [res.data, ...prev]))
      .catch(err => {
        console.error(err);
        window.alert(err.response?.data?.message || 'Failed to create plan');
      });
  };

  const handleEditPlan = (plan) => {
    const payload = buildPlanPayload(plan);
    if (!payload) return;

    API.patch(`/plans/${plan._id}`, payload)
      .then(res => setPlans(prev => prev.map(item => item._id === res.data._id ? res.data : item)))
      .catch(err => {
        console.error(err);
        window.alert(err.response?.data?.message || 'Failed to update plan');
      });
  };

  const handleDeletePlan = (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;

    API.delete(`/plans/${plan._id}`)
      .then(() => setPlans(prev => prev.filter(item => item._id !== plan._id)))
      .catch(err => {
        console.error(err);
        window.alert(err.response?.data?.message || 'Failed to delete plan');
      });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
          <p className="mt-1 text-gray-500">Manage free trial and paid plans shown to managers</p>
        </div>
        <button onClick={handleCreatePlan} className="flex items-center gap-2 rounded-md bg-[#6C3EF4] px-5 py-3 font-bold text-white shadow-lg shadow-purple-100 transition-all hover:bg-[#5a32cc]">
          <Layers size={20} /> Create New Plan
        </button>
      </div>

      <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={18} className="text-gray-500" />
          {['All', 'trial', '3months', '6months', '1year'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-md px-4 py-2 font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-[#6C3EF4] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter === 'All' ? 'All Plans' : filter === 'trial' ? 'Free Trial' : filter === '3months' ? '3 Months' : filter === '6months' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {loading ? (
          <div>Loading plans...</div>
        ) : filteredPlans.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
            No plans found.
          </div>
        ) : filteredPlans.map((plan) => (
          <PlanCard
            key={plan._id}
            plan={plan}
            onEdit={() => handleEditPlan(plan)}
            onDelete={() => handleDeletePlan(plan)}
          />
        ))}
      </div>
    </div>
  );
};

export default Plans;
