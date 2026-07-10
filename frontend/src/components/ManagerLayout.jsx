import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, LockKeyhole } from 'lucide-react';
import Sidebar from './Sidebar';
import SubscriptionModal from './SubscriptionModal';
import { useAuth } from '../context/AuthContext';
import useSubscriptionStatus from '../hooks/useSubscriptionStatus';

const ManagerLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: statusData, isLoading: loadingStatus } = useSubscriptionStatus(true);
  const subscriptionStatus = statusData ?? null;
  const [showSubscription, setShowSubscription] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Note: subscription status is provided by react-query and will update when the user activates a subscription

  const isPaymentPage = location.pathname.startsWith('/manager/payment');
  const isBlocked = !loadingStatus && subscriptionStatus && !subscriptionStatus.canUseApp && !isPaymentPage;
  const shouldHideAppShell = isPaymentPage || isBlocked;

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100">
      {!shouldHideAppShell && <Sidebar onLogout={handleLogout} />}
        <div className={shouldHideAppShell ? 'w-full' : 'w-full min-w-0 md:ml-80 md:w-[calc(100%-20rem)]'}>
          <main className="manager-page-shell min-h-screen w-full min-w-0 overflow-x-hidden px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
          {loadingStatus && !isPaymentPage ? (
            <div className="flex min-h-[70vh] items-center justify-center gap-2 text-sm font-bold text-slate-500">
              <Loader2 size={18} className="animate-spin" />
              Checking subscription...
            </div>
          ) : isBlocked ? (
            <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
              <div className="w-full rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md bg-red-50 text-red-600">
                  <LockKeyhole size={24} />
                </div>
                <h1 className="mt-4 text-2xl font-black text-slate-950">Subscription required</h1>
                <p className="mt-2 text-sm font-medium text-slate-600">
                  {subscriptionStatus.message || 'Your free trial or paid subscription has expired. Renew a plan to continue using manager features.'}
                </p>
                <button
                  type="button"
                  onClick={() => setShowSubscription(true)}
                  className="mx-auto mt-6 flex h-11 items-center justify-center gap-2 rounded-md bg-slate-900 px-5 text-sm font-black text-white hover:bg-slate-800"
                >
                  <CreditCard size={18} />
                  Plan Subscription
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
      <SubscriptionModal open={showSubscription} onClose={() => setShowSubscription(false)} />
      
    </div>
  );
};

export default ManagerLayout;
