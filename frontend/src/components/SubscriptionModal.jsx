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
    features: ['14 days access', '1 seller included', 'Basic reports'],
    isTrial: true,
    isFallback: true
  },
  {
    _id: 'fallback-pro',
    name: 'Pro',
    description: 'Unlock premium seller management, scanner access and reporting tools.',
    price: 4000,
    durationDays: 365,
    maxSellers: 5,
    features: ['5 sellers included', 'Scanner access', 'Advanced reports', 'Priority dashboard'],
    isFallback: true
  },
  {
    _id: 'fallback-business',
    name: 'Business',
    description: 'Create reports faster and manage a growing sales team with confidence.',
    price: 6800,
    durationDays: 365,
    maxSellers: 15,
    features: ['15 sellers included', 'Team performance reports', 'Payment tracking', 'Manager tools'],
    isFallback: true
  },
  {
    _id: 'fallback-enterprise',
    name: 'Enterprise',
    description: 'For larger teams that need higher seller limits and guided setup.',
    price: 12000,
    durationDays: 365,
    maxSellers: 0,
    features: ['Unlimited sellers', 'Full reporting suite', 'Custom setup support', 'Secure checkout'],
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
        {features.map((feature) => (
          <div key={feature} className="flex items-start gap-2">
            <Check size={17} className="mt-0.5 shrink-0 text-emerald-600" />
            <span>{feature}</span>
          </div>
        ))}
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
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState('');
  const [plansWarning, setPlansWarning] = useState('');
  const [billingCycle, setBillingCycle] = useState('yearly');

  const isControlled = typeof open === 'boolean';
  const isOpen = isControlled ? open : internalOpen;
  const currentPlanId = status?.subscription?.planId?._id || status?.plan?._id;

  const promptKey = useMemo(() => user?._id ? `subscriptionPromptSeen_${user._id}` : null, [user?._id]);

  const loadData = async () => {
    if (user?.role !== 'manager') return;
    setLoading(true);
    setError('');
    setPlansWarning('');
    try {
      const statusRes = await API.get('/subscriptions/my-status');
      setStatus(statusRes.data);
    } catch (err) {
      setStatus({
        canUseApp: false,
        plan: null,
        endDate: null,
        daysRemaining: 0,
        paymentSettingsReady: false
      });
    }

    try {
      const plansRes = await API.get('/subscriptions/plans');
      const loadedPlans = plansRes.data || [];
      setPlans(loadedPlans.length ? loadedPlans : fallbackPlans);
      if (!loadedPlans.length) {
        setPlansWarning('No active plans found. Add plans from Admin Plans to enable checkout.');
      }
    } catch (err) {
      setPlans(fallbackPlans);
      setPlansWarning(err.response?.data?.message || 'Plans API is not reachable. Showing sample cards until backend plans load.');
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

        <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 px-5 py-4 text-white md:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-3 text-sm font-semibold sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="shrink-0" />
              <span>Premium access keeps your sellers, reports, scanner and manager tools active.</span>
            </div>
            <span className="rounded-lg border border-white/25 px-4 py-2 text-xs font-black">Secure checkout</span>
          </div>
        </div>

        <div className="px-5 pb-8 pt-12 md:px-8 md:pb-10">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-4xl font-black text-slate-950 sm:text-5xl md:text-6xl">Plans and pricing</h2>
            <div className="mx-auto mt-7 inline-flex rounded-full bg-white p-2 shadow-lg shadow-violet-100">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-black text-white"
              >
                <BadgeCheck size={18} />
                Individuals and business
              </button>
              <button
                type="button"
                className="flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black text-slate-700"
              >
                <Crown size={18} className="text-amber-500" />
                Premium
              </button>
            </div>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-3 sm:grid-cols-3">
            <StatPill
              icon={ShieldCheck}
              label="Status"
              value={status?.canUseApp ? 'Active' : 'Expired'}
              tone={status?.canUseApp ? 'text-emerald-600' : 'text-red-600'}
            />
            <StatPill icon={CreditCard} label="Current plan" value={status?.plan?.name || 'No active plan'} tone="text-blue-700" />
            <StatPill icon={CalendarDays} label="Expiry" value={formatDate(status?.endDate)} tone="text-amber-600" />
          </div>

          <div className="mx-auto mt-10 flex max-w-5xl flex-wrap items-center gap-3 text-sm font-bold text-slate-700">
            <span>Monthly</span>
            <button
              type="button"
              onClick={() => setBillingCycle((cycle) => cycle === 'yearly' ? 'monthly' : 'yearly')}
              className={`relative h-7 w-12 rounded-full transition ${billingCycle === 'yearly' ? 'bg-violet-600' : 'bg-slate-300'}`}
              aria-label="Toggle billing cycle"
            >
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${billingCycle === 'yearly' ? 'left-6' : 'left-1'}`} />
            </button>
            <span>Yearly</span>
            <span className="rounded-full bg-violet-600 px-3 py-1 text-xs font-black text-white">Save from 16%</span>
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

              <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
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
