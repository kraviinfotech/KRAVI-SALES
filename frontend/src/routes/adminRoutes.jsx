import React from 'react';
import AdminDashboard from '../pages/Admin/Dashboard';
import AdminCompanies from '../pages/Admin/Companies';
import AdminManagers from '../pages/Admin/Managers';
import AdminPlans from '../pages/Admin/Plans';
import AdminPayments from '../pages/Admin/Payments';
import AdminReports from '../pages/Admin/Reports';
import AdminSettings from '../pages/Admin/Settings';

export const adminRoutes = [
  { path: '/admin', element: <AdminDashboard /> },
  { path: '/admin/companies', element: <AdminCompanies /> },
  { path: '/admin/managers', element: <AdminManagers /> },
  { path: '/admin/plans', element: <AdminPlans /> },
  { path: '/admin/payments', element: <AdminPayments /> },
  { path: '/admin/reports', element: <AdminReports /> },
  { path: '/admin/settings', element: <AdminSettings /> },
  { path: '/admin/*', element: <AdminDashboard /> }
];
