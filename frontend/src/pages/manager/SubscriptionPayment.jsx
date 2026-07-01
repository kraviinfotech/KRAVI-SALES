import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import SubscriptionModal from '../../components/SubscriptionModal';

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
  const navigate = useNavigate();
  const { updateSession } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [showPlans, setShowPlans] = useState(false);

  const selectedPlan = useMemo(
    () => plans.find((plan) => String(plan._id) === String(state?.planId)),
    [plans, state?.planId]
  );
  const selectedDurationDays = selectedPlan
    ? Number(selectedPlan.durationDays || (Number(selectedPlan.durationMonths || 0) * 30) || 0)
    : 0;

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await API.get('/subscriptions/plans');
        setPlans(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load payment details');
      } finally {
        setLoading(false);
      }
    };
    loadPlans();
  }, []);

  const clearRazorpayStorage = () => {
    try {
      // Razorpay SDK automatically stores some keys in localStorage.
      // We clean them up for better security/privacy.
      Object.keys(localStorage).forEach((key) => {
        if (key.toLowerCase().includes('rzp') || key.toLowerCase().includes('razorpay')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('Failed to clear Razorpay storage', e);
    }
  };

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
            clearRazorpayStorage();
            navigate('/manager', { replace: true, state: { subscriptionActivated: true } });
          } catch (err) {
            setError(err.response?.data?.message || 'Payment was received but verification failed. Please contact support.');
          } finally {
            setPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            clearRazorpayStorage();
          }
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
          <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
            Please choose a subscription plan before starting payment.
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

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
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
