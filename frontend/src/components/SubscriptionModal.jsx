import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  Crown,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useSubscriptionStatus from '../hooks/useSubscriptionStatus';
import usePlans from '../hooks/usePlans';

const formatDate = (value) => {
  if (!value) return 'Not active';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

const formatPrice = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

const getPlanDays = (plan) => Number(plan.durationDays || (Number(plan.durationMonths || 0) * 30) || 0);

const fallbackPlans = [
  {
    _id: 'fallback-free-trial',
    name: 'Free',
    description: 'Try the manager dashboard and basic seller workflow before upgrading.',
    price: 0,
    durationDays: 14,
    maxSellers: 1,
    features: [],
    isTrial: true,
    isFallback: true
  },
  {
    _id: 'fallback-1-month',
    name: '1 Month',
    description: 'Short term plan for your business needs.',
    price: 299,
    durationMonths: 1,
    durationDays: 30,
    maxSellers: 5,
    features: [],
    isFallback: true
  },
  {
    _id: 'fallback-3-month',
    name: '3 Months',
    description: 'Quarterly plan to manage a growing sales team.',
    price: 799,
    durationMonths: 3,
    durationDays: 90,
    maxSellers: 12,
    features: [],
    isFallback: true
  },
  {
    _id: 'fallback-1-year',
    name: '1 Year',
    description: 'Best value for long term business operations.',
    price: 2999,
    durationMonths: 12,
    durationDays: 365,
    maxSellers: 20,
    features: [],
    isFallback: true
  }
];

const getPlanAudience = (plan) => {
  if (Number(plan.maxSellers || 0) > 0) return `${plan.maxSellers} sellers`;
  if (plan.isTrial || Number(plan.price) <= 0) return 'Individuals';
  return 'Individuals and teams';
};

const getPlanTone = (index, isCurrent) => {
  if (isCurrent) return 'border-emerald-400 bg-emerald-50/80 shadow-emerald-100';
  if (index === 1) return 'border-violet-300 bg-white shadow-violet-100';
  if (index === 2) return 'border-blue-300 bg-white shadow-blue-100';
  return 'border-slate-200 bg-white shadow-slate-200';
};

const StatPill = ({ icon: Icon, label, value, tone }) => (
  <div className="min-w-0 rounded-lg border border-white/70 bg-white/75 p-4 shadow-sm">
    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
      <Icon size={16} className={tone} />
      <span>{label}</span>
    </div>
    <p className="mt-2 truncate text-xl font-black text-slate-950">{value}</p>
  </div>
);

const PlanCard = ({ plan, index, currentPlanId, onSelect }) => {
  const isCurrent = currentPlanId && String(currentPlanId) === String(plan._id);
  const isFree = Number(plan.price) <= 0;
  const checkoutDisabled = isCurrent || isFree || plan.isFallback;
  const days = getPlanDays(plan);
  const features = plan.features?.length
    ? plan.features.slice(0, 5)
    : [
        `${days || 14} days access`,
        `${getPlanAudience(plan)} included`,
        'Secure manager dashboard'
      ];
  const isRecommended = index === 1 && !isFree;

  return (
    <article className={`relative flex min-h-[390px] flex-col rounded-lg border p-6 shadow-lg ${getPlanTone(index, isCurrent)}`}>
      {isRecommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2 text-xs font-black text-white shadow-lg">
          Recommended
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
          {index >= 3 ? <Building2 size={17} /> : <Users size={17} />}
          <span>{getPlanAudience(plan)}</span>
        </div>
        {!isFree && <Crown size={28} className="text-amber-500" />}
      </div>

      <div className="mt-8">
        <h3 className="text-3xl font-black text-slate-950">{plan.name}</h3>
        <p className="mt-3 min-h-[52px] text-base font-medium leading-relaxed text-slate-600">
          {plan.description || 'Unlock premium tools and keep your business workflow running smoothly.'}
        </p>
      </div>

      <div className="mt-7">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-slate-950">{formatPrice(plan.price)}</span>
        </div>
        <p className="mt-1 text-sm font-bold text-slate-600">
          {isFree ? `for ${days || 14} days trial` : `for ${days || 30} days access`}
        </p>
      </div>

      <div className="mt-6 space-y-3 text-sm font-semibold text-slate-700">

        <div className="flex items-start gap-2">
          <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>Unlimited Shop Records,Daily&Month</span>
        </div>
        <div className="flex items-start gap-2">
          <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>PDF & Excel Export</span>
        </div>
        <div className="flex items-start gap-2">
          <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>AI Chatbot Support</span>
        </div>
        <div className="flex items-start gap-2">
          <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>24×7 Premium Support</span>
        </div>
        <div className="flex items-start gap-2">
          <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />
          <span>SalesTracking</span>
        </div>
      </div>

      <button
        type="button"
        disabled={checkoutDisabled}
        onClick={() => onSelect(plan)}
        className={`mt-auto flex h-12 items-center justify-center rounded-lg text-sm font-black transition-all ${
          isCurrent
            ? 'bg-emerald-100 text-emerald-700'
            : isFree || plan.isFallback
              ? 'bg-slate-100 text-slate-500'
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-fuchsia-700'
        }`}
      >
        {isCurrent ? 'Current plan' : isFree ? 'Auto assigned' : plan.isFallback ? 'Add in admin to checkout' : 'Checkout'}
      </button>
    </article>
  );
};

const SubscriptionModal = ({ open, onClose, forceOpen = false }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internalOpen, setInternalOpen] = useState(false);

  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? open : internalOpen;
  const promptKey = useMemo(() => user?._id ? `subscriptionPromptSeen_${user._id}` : null, [user?._id]);

  const { data: statusData, isLoading: statusLoading, error: statusError } = useSubscriptionStatus(Boolean(user && user.role === 'manager'));
  const { data: plansData, isLoading: plansLoading, error: plansError } = usePlans(Boolean(user && user.role === 'manager'));

  const status = statusData ?? null;
  const plans = Array.isArray(plansData) ? plansData : [];
  const loading = statusLoading || plansLoading;
  const error = statusError?.message || plansError?.message || '';
  const plansWarning = status && !status.paymentSettingsReady
    ? 'Razorpay keys are not configured in Admin Settings yet. Managers can view plans, but checkout will be unavailable until the admin saves Key ID and Key Secret.'
    : '';
  const currentPlanId = status?.subscription?.planId?._id || status?.plan?._id;

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
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/55 p-0 backdrop-blur-sm sm:p-4">
      <div className="mx-auto min-h-screen w-full max-w-7xl overflow-hidden rounded-none bg-[#f4f1ff] shadow-2xl sm:min-h-0 sm:rounded-lg">
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-violet-100 bg-white/90 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <CreditCard size={20} />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-violet-700">Subscription</p>
              <p className="text-sm font-bold text-slate-600">Choose a plan and continue with Razorpay</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
            aria-label="Close subscription pricing"
          >
            <X size={22} />
          </button>
        </div>


        <div className="px-5 pb-8 pt-12 md:px-8 md:pb-10">
          <div className="mx-auto max-w-5xl text-center">
            <h4 className="text-4xl font-black text-slate-950 sm:text-5xl md:text-6xl">Plans and pricing</h4>
          
          </div>

        
        

          {loading ? (
            <div className="mx-auto mt-10 flex min-h-64 max-w-5xl items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/70 text-sm font-bold text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Loading subscription details...
            </div>
          ) : error ? (
            <div className="mx-auto mt-10 max-w-5xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
          ) : (
            <>
              {!status?.paymentSettingsReady && (
                <div className="mx-auto mt-8 max-w-5xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  Razorpay keys are not configured in Admin Settings yet. Managers can view plans, but checkout will be unavailable until the admin saves Key ID and Key Secret.
                </div>
              )}

              {plansWarning && (
                <div className="mx-auto mt-8 max-w-5xl rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                  {plansWarning}
                </div>
              )}

              <div className="mx-auto mt-10 grid max-w-5xl max-h-xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {plans.map((plan, index) => (
                  <PlanCard key={plan._id} plan={plan} index={index} currentPlanId={currentPlanId} onSelect={handleSelect} />
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
