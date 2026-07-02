import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import SubscriptionModal from '../../components/SubscriptionModal';
import usePlans from '../../hooks/usePlans';

const loadRazorpayScript = () => new Promise((resolve) => {
  if (window.Razorpay) return resolve(true);

  const script = document.createElement('script');
  script.src = 'https://checkout.razorpay.com/v1/checkout.js';
  script.onload = () => resolve(true);
  script.onerror = () => resolve(false);
  document.body.appendChild(script);
});

const SubscriptionPayment = () => {
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateSession } = useAuth();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [showPlans, setShowPlans] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState(state?.planId || null);
  const mode = searchParams.get('mode') || state?.mode;
  const isBuyMode = mode === 'buy';
  const { data: plansData, isLoading: plansLoading, error: plansError } = usePlans(Boolean(true));
  const plans = useMemo(() => (Array.isArray(plansData) ? plansData : []), [plansData]);
  const selectedPlan = useMemo(
    () => plans.find((plan) => String(plan._id) === String(selectedPlanId)),
    [plans, selectedPlanId]
  );
  const selectedDurationDays = selectedPlan
    ? Number(selectedPlan.durationDays || (Number(selectedPlan.durationMonths || 0) * 30) || 0)
    : 0;
  const loading = plansLoading;
  const queryError = plansError?.message || 'Unable to load payment details';
  const displayError = error || queryError;

  const startPayment = async () => {
    if (!selectedPlan) return;
    setPaying(true);
    setError('');

    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        throw new Error('Razorpay checkout could not be loaded. Please check your internet connection.');
      }

      const orderRes = await API.post('/subscriptions/checkout/order', { planId: selectedPlan._id });
      const { keyId, order, plan, user } = orderRes.data;

      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'SalesFlow',
        description: `${plan.name} subscription`,
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.mobile || ''
        },
        notes: {
          planId: plan._id
        },
        handler: async (response) => {
          try {
            const verifyRes = await API.post('/subscriptions/checkout/verify', {
              planId: selectedPlan._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            updateSession({ token: verifyRes.data.token, user: verifyRes.data.user });
            navigate('/manager', { replace: true, state: { subscriptionActivated: true } });
          } catch (err) {
            setError(err.response?.data?.message || 'Payment was received but verification failed. Please contact support.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => setPaying(false)
        },
        theme: {
          color: '#111827'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to start payment');
      setPaying(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/*
      <button
        type="button"
        onClick={() => setShowPlans(true)}
        className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-950"
      >
        <ArrowLeft size={18} />
        Back to plans
      </button>
      */}

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-900 text-white">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Payment</p>
            <h1 className="text-xl font-black text-slate-950">Complete your subscription</h1>
            <p className="mt-1 text-sm text-slate-500">You will be redirected to Razorpay Checkout to finish the secure payment.</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center gap-2 text-sm font-bold text-slate-500">
            <Loader2 size={18} className="animate-spin" />
            Loading plan...
          </div>
        ) : !selectedPlan ? (
          <div className="mt-8 space-y-4">
            <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              Choose a paid plan below to continue. The free trial plan is assigned automatically during manager registration.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((plan) => {
                const planDays = Number(plan.durationDays || (Number(plan.durationMonths || 0) * 30) || 0);
                const canSelect = Number(plan.price) > 0;
                return (
                  <div key={plan._id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h2 className="text-lg font-black text-slate-950">{plan.name}</h2>
                        <p className="text-sm text-slate-500">{plan.description || 'Subscription plan'}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {planDays} days
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-950">Rs. {Number(plan.price || 0).toLocaleString('en-IN')}</span>
                      <span className="text-sm text-slate-500">/{plan.durationMonths ? `${plan.durationMonths} month${Number(plan.durationMonths) > 1 ? 's' : ''}` : 'term'}</span>
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600">
                      {(plan.features || []).slice(0, 4).map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <ShieldCheck size={16} className="mt-0.5 text-emerald-600" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => canSelect && setSelectedPlanId(plan._id)}
                      disabled={!canSelect}
                      className={`mt-6 w-full rounded-md px-3 py-2 text-sm font-black transition ${canSelect ? 'bg-slate-900 text-white hover:bg-slate-800' : 'cursor-not-allowed bg-slate-100 text-slate-500'}`}
                    >
                      {canSelect ? 'Choose plan' : 'Free trial plan'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{selectedPlan.name}</h2>
                  <p className="text-sm text-slate-500">{selectedPlan.description || 'SalesFlow subscription plan'}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-black text-slate-950">Rs. {Number(selectedPlan.price || 0).toLocaleString('en-IN')}</p>
                  <p className="text-xs font-bold text-slate-500">{selectedDurationDays} days access</p>
                </div>
              </div>
            </div>

            {(selectedPlan.features || []).length > 0 && (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {selectedPlan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    {feature}
                  </div>
                ))}
              </div>
            )}

            {displayError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{displayError}</div>
            )}

            <button
              type="button"
              disabled={paying || Number(selectedPlan.price) <= 0}
              onClick={startPayment}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-slate-900 text-sm font-black text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying && <Loader2 size={18} className="animate-spin" />}
              {paying ? 'Opening Razorpay...' : 'Pay and Activate Plan'}
            </button>
          </div>
        )}
      </div>
      {showPlans && (
        <SubscriptionModal open={showPlans} onClose={() => setShowPlans(false)} />
      )}
    </div>
  );
};

export default SubscriptionPayment;
