import React, { useEffect, useState } from 'react';
import { Check, Edit3, Filter, Layers, Trash2 } from 'lucide-react';
import API from '../../api/axios';

const FILTERS = ['All', 'trial', '1month', '3months', '1year'];

const durationLabel = (plan) => {
  const days = Number(plan.durationDays || 0);
  if (days > 0) return `${days} Days`;
  return `${Number(plan.durationMonths || 0)} Months`;
};

const getFilterLabel = (filter) => {
  if (filter === 'All') return 'All Plans';
  if (filter === 'trial') return 'Free Trial';
  if (filter === '1month') return '1 Month';
  if (filter === '3months') return '3 Months';
  return '1 Year';
};

const PlanFeature = ({ children }) => (
  <div className="flex items-center gap-3 text-sm text-gray-600">
    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-50 text-[#6C3EF4]">
      <Check size={12} />
    </div>
    {children}
  </div>
);

const PlanCard = ({ plan, onEdit, onDelete }) => {
  const sellerLimit = Number(plan.maxSellers || plan.managers || 0);

  return (
    <div className={`rounded-lg border-2 bg-white p-6 transition-all hover:shadow-xl ${plan.isActive ? 'border-[#6C3EF4]' : 'border-gray-100'}`}>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-black text-gray-900">
              Rs. {Number(plan.price || 0).toLocaleString('en-IN')}
            </span>
            <span className="text-sm font-medium text-gray-500">/{durationLabel(plan)}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${plan.isActive ? 'bg-purple-100 text-[#6C3EF4]' : 'bg-gray-100 text-gray-500'}`}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </span>
          {plan.isTrial && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
              Free Trial
            </span>
          )}
        </div>
      </div>

      <div className="mb-8 space-y-4">
        <PlanFeature>Max {sellerLimit > 0 ? sellerLimit : 'Unlimited'} Sellers</PlanFeature>
        <PlanFeature>Unlimited Shop Records, Daily & Month</PlanFeature>
        <PlanFeature>PDF & Excel Export</PlanFeature>
        <PlanFeature>AI Chatbot Support</PlanFeature>
        <PlanFeature>24×7 Premium Support</PlanFeature>
        <PlanFeature>Sales Tracking</PlanFeature>
      </div>

      <div className="flex gap-2 border-t border-gray-50 pt-6">
        <button type="button" onClick={onEdit} className="flex flex-1 items-center justify-center gap-2 rounded-md border border-gray-200 py-2.5 text-sm font-semibold text-gray-600 transition-all hover:bg-gray-50">
          <Edit3 size={16} /> Edit
        </button>
        <button type="button" onClick={onDelete} className="rounded-md border border-red-100 px-4 py-2.5 text-red-500 transition-all hover:bg-red-50">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const PlansHeader = ({ onCreate }) => (
  <div className="flex items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Subscription Plans</h1>
      <p className="mt-1 text-gray-500">Manage free trial and paid plans shown to managers</p>
    </div>
    <button type="button" onClick={onCreate} className="flex items-center gap-2 rounded-md bg-[#6C3EF4] px-5 py-3 font-bold text-white shadow-lg shadow-purple-100 transition-all hover:bg-[#5a32cc]">
      <Layers size={20} /> Create New Plan
    </button>
  </div>
);

const PlansFilterBar = ({ activeFilter, onChange }) => (
  <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-center gap-3">
      <Filter size={18} className="text-gray-500" />
      {FILTERS.map((filter) => (
        <button
          type="button"
          key={filter}
          onClick={() => onChange(filter)}
          className={`rounded-md px-4 py-2 font-medium transition-all ${
            activeFilter === filter
              ? 'bg-[#6C3EF4] text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {getFilterLabel(filter)}
        </button>
      ))}
    </div>
  </div>
);

const PlansGrid = ({ loading, plans, onEdit, onDelete }) => (
  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
    {loading ? (
      <div>Loading plans...</div>
    ) : plans.length === 0 ? (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm font-semibold text-gray-500">
        No plans found.
      </div>
    ) : (
      plans.map((plan) => (
        <PlanCard
          key={plan._id}
          plan={plan}
          onEdit={() => onEdit(plan)}
          onDelete={() => onDelete(plan)}
        />
      ))
    )}
  </div>
);

const buildPlanPayload = (plan = {}) => {
  const name = window.prompt('Plan name', plan.name || '');
  if (!name) return null;

  const price = Number(window.prompt('Price (number)', plan.price ?? '0') || 0);
  const durationMonths = Number(
    window.prompt('Duration months', plan.durationMonths ?? (price === 0 ? 0 : 3)) || 0
  );
  const durationDays = Number(
    window.prompt('Duration days', plan.durationDays ?? (price === 0 ? 14 : durationMonths * 30)) || 0
  );
  const maxSellers = Number(
    window.prompt('Seller limit (0 for unlimited)', plan.maxSellers ?? plan.managers ?? 5) || 0
  );
  const storageGb = Number(window.prompt('Storage GB', plan.storageGb ?? 2) || 2);

  const features = (
    window.prompt('Comma separated features', (plan.features || []).join(', ')) || ''
  )
    .split(',')
    .flatMap((feature) => {
      const trimmedFeature = feature.trim();
      return trimmedFeature ? [trimmedFeature] : [];
    });

  const isTrial = window.confirm(
    'Mark this as the free trial plan? Click OK for yes, Cancel for no.'
  );

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
    isActive: plan.isActive ?? true,
  };
};

const filterPlans = (plans, activeFilter) => {
  if (activeFilter === 'All') return plans;

  return plans.filter((plan) => {
    if (activeFilter === 'trial') return plan.isTrial || Number(plan.price) === 0;
    if (activeFilter === '1month') return Number(plan.durationMonths) === 1;
    if (activeFilter === '3months') return Number(plan.durationMonths) === 3;
    if (activeFilter === '1year') return Number(plan.durationMonths) === 12;
    return true;
  });
};

const Plans = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    API.get('/plans')
      .then((res) => setPlans(res.data))
      .catch((err) => console.error('Failed to load plans', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPlans = filterPlans(plans, activeFilter);

  const handleCreatePlan = () => {
    const payload = buildPlanPayload();
    if (!payload) return;

    API.post('/plans', payload)
      .then((res) => setPlans((prev) => [res.data, ...prev]))
      .catch((err) => {
        console.error(err);
        window.alert(err.response?.data?.message || 'Failed to create plan');
      });
  };

  const handleEditPlan = (plan) => {
    const payload = buildPlanPayload(plan);
    if (!payload) return;

    API.patch(`/plans/${plan._id}`, payload)
      .then((res) =>
        setPlans((prev) =>
          prev.map((item) => (item._id === res.data._id ? res.data : item))
        )
      )
      .catch((err) => {
        console.error(err);
        window.alert(err.response?.data?.message || 'Failed to update plan');
      });
  };

  const handleDeletePlan = (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}"? This cannot be undone.`)) return;

    API.delete(`/plans/${plan._id}`)
      .then(() =>
        setPlans((prev) => prev.filter((item) => item._id !== plan._id))
      )
      .catch((err) => {
        console.error(err);
        window.alert(err.response?.data?.message || 'Failed to delete plan');
      });
  };

  return (
    <div className="space-y-8">
      <PlansHeader onCreate={handleCreatePlan} />
      <PlansFilterBar activeFilter={activeFilter} onChange={setActiveFilter} />
      <PlansGrid
        loading={loading}
        plans={filteredPlans}
        onEdit={handleEditPlan}
        onDelete={handleDeletePlan}
      />
    </div>
  );
};

export default Plans;
