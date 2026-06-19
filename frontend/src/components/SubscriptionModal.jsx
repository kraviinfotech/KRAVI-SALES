import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays, Check, CreditCard, Loader2, ShieldCheck, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const formatDate = (value) => {
  if (!value) return 'Not active';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const getPlanDays = (plan) => Number(plan.durationDays || (Number(plan.durationMonths || 0) * 30) || 0);

const PlanCard = ({ plan, currentPlanId, onSelect }) => {
  const isCurrent = currentPlanId && String(currentPlanId) === String(plan._id);
  const isFree = Number(plan.price) <= 0;
  const days = getPlanDays(plan);

  return (
    <div className={`flex min-h-[280px] flex-col rounded-lg border p-5 shadow-sm ${
      isCurrent ? 'border-emerald-400 bg-emerald-50/60' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-950">{plan.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{plan.description || `${days} days access`}</p>
        </div>
        {plan.isTrial && (
          <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-blue-700">
            Trial
          </span>
        )}
      </div>

      <div className="mt-5 flex items-end gap-1">
        <span className="text-3xl font-black text-slate-950">Rs. {Number(plan.price || 0).toLocaleString('en-IN')}</span>
        <span className="pb-1 text-xs font-bold text-slate-500">/{days || 0} days</span>
      </div>

      <div className="mt-5 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-blue-700" />
          <span>{Number(plan.maxSellers || 0) > 0 ? `${plan.maxSellers} sellers` : 'Unlimited sellers'}</span>
        </div>
        {(plan.features || []).slice(0, 5).map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={isCurrent || isFree}
        onClick={() => onSelect(plan)}
        className={`mt-auto flex h-10 items-center justify-center rounded-md text-sm font-black transition-colors ${
          isCurrent
            ? 'bg-emerald-100 text-emerald-700'
            : isFree
              ? 'bg-slate-100 text-slate-500'
              : 'bg-slate-900 text-white hover:bg-slate-800'
        }`}
      >
        {isCurrent ? 'Current Plan' : isFree ? 'Auto Assigned' : 'Choose Plan'}
      </button>
    </div>
  );
};

const SubscriptionModal = ({ open, onClose, forceOpen = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');

  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? open : internalOpen;
  const currentPlanId = status?.subscription?.planId?._id || status?.plan?._id;

  const promptKey = useMemo(() => user?._id ? `subscriptionPromptSeen_${user._id}` : null, [user?._id]);

  const loadData = async () => {
    if (user?.role !== 'manager') return;
    setLoading(true);
    setError('');
    try {
      const [statusRes, plansRes] = await Promise.all([
        API.get('/subscriptions/my-status'),
        API.get('/subscriptions/plans')
      ]);
      setStatus(statusRes.data);
      setPlans(plansRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?._id]);

  useEffect(() => {
    if (!user || user.role !== 'manager' || isControlled || forceOpen || !promptKey) return;
    if (sessionStorage.getItem(promptKey)) return;

    const timer = setTimeout(() => setInternalOpen(true), 250);
    return () => clearTimeout(timer);
  }, [forceOpen, isControlled, promptKey, user]);

  const handleClose = () => {
    if (promptKey) sessionStorage.setItem(promptKey, 'true');
    if (onClose) onClose();
    if (!isControlled) setInternalOpen(false);
  };

  const handleSelect = (plan) => {
    handleClose();
    navigate('/manager/payment', { state: { planId: plan._id } });
  };

  if (!isOpen || user?.role !== 'manager') return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Subscription</p>
            <h2 className="text-xl font-black text-slate-950">Choose a plan for SalesFlow</h2>
            <p className="mt-1 text-sm text-slate-500">Admin-created plans are shown here. Your team access follows the selected plan expiry.</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close subscription card"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-2 text-sm font-bold text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading subscription details...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <ShieldCheck size={18} className="text-emerald-600" />
                    Current Status
                  </div>
                  <p className={`mt-2 text-2xl font-black ${status?.canUseApp ? 'text-emerald-700' : 'text-red-700'}`}>
                    {status?.canUseApp ? 'Active' : 'Expired'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <CreditCard size={18} className="text-blue-700" />
                    Plan
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-950">{status?.plan?.name || 'No active plan'}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700">
                    <CalendarDays size={18} className="text-amber-600" />
                    Expiry
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-950">{formatDate(status?.endDate)}</p>
                  <p className="text-xs font-bold text-slate-500">{status?.daysRemaining || 0} days remaining</p>
                </div>
              </div>

              {!status?.paymentSettingsReady && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  Razorpay keys are not configured in Admin Settings yet. Managers can view plans, but checkout will be unavailable until the admin saves Key ID and Key Secret.
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                  <PlanCard key={plan._id} plan={plan} currentPlanId={currentPlanId} onSelect={handleSelect} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SubscriptionModal;
