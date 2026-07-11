import React from 'react';
import SellerDashboard from '../pages/seller/SellerDashboard';
import MyRecords from '../pages/seller/MyRecords';
import StartSelling from '../pages/seller/StartSelling';
import AddShop from '../pages/seller/AddShop';
import AddProducts from '../pages/seller/AddProducts';
import ReviewSave from '../pages/seller/ReviewSave';
import SellerReports from '../pages/seller/SellerReports';
import SellerProfile from '../pages/seller/SellerProfile';

export const sellerRoutes = [
  { path: '/dashboard', element: <SellerDashboard /> },
  { path: '/my-records', element: <MyRecords /> },
  { path: '/seller/reports', element: <SellerReports /> },
  { path: '/seller/profile', element: <SellerProfile /> },
  {
    path: '/sell',
    element: <StartSelling />,
    children: [
      { path: 'shop', element: <AddShop /> },
      { path: 'products', element: <AddProducts /> },
      { path: 'review', element: <ReviewSave /> },
      { index: true, element: <div /> }
    ]
  }
];
