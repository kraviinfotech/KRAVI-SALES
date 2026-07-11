import React from 'react';
import ManagerDashboard from '../pages/manager/ManagerDashboard';
import SubscriptionPayment from '../pages/manager/SubscriptionPayment';
import SubscriptionBilling from '../pages/manager/SubscriptionBilling';
import AddSeller from '../pages/manager/AddSeller';
import Reports from '../pages/manager/Reports';
import ManagerRecords from '../pages/manager/ManagerRecords';
import ProductsOverview from '../pages/manager/ProductsOverview';
import ManagerSellerDetail from '../pages/manager/ManagerSellerDetail';
import ManagerProfile from '../pages/manager/ManagerProfile';
import ManagerNotifications from '../pages/manager/ManagerNotifications';
import ManagerAttendance from '../pages/manager/ManagerAttendance';
import ManagerCalls from '../pages/manager/ManagerCalls';

export const managerRoutes = [
  { path: '/manager', element: <ManagerDashboard /> },
  { path: '/manager/payment', element: <SubscriptionPayment /> },
  { path: '/manager/subscription', element: <SubscriptionBilling /> },
  { path: '/manager/sellers', element: <AddSeller /> },
  { path: '/manager/records', element: <ManagerRecords /> },
  { path: '/manager/reports', element: <Reports /> },
  { path: '/manager/products', element: <ProductsOverview /> },
  { path: '/manager/profile', element: <ManagerProfile /> },
  { path: '/manager/notifications', element: <ManagerNotifications /> },
  { path: '/manager/seller/:sellerId', element: <ManagerSellerDetail /> },
  { path: '/manager/attendance', element: <ManagerAttendance /> },
  { path: '/manager/calls', element: <ManagerCalls /> }
];
