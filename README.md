# KRAVI-SALES

KRAVI-SALES is a sales management application with backend and frontend components. It includes user authentication, company management, subscription management, payment processing, reporting, and sales tracking.

## Repository Structure

```
KRAVI-SALES/
├── .gitignore
├── AdminLayout.jsx
├── Payment.js
├── README.md
├── Subscription.js
├── SubscriptionPlan.js
├── backend/
│   ├── package.json
│   ├── promote.js
│   ├── seed.js
│   ├── seedPlans.js
│   ├── server.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   └── subscriptionMiddleware.js
│   ├── models/
│   │   ├── Attendance.js
│   │   ├── Company.js
│   │   ├── Notification.js
│   │   ├── Payment.js
│   │   ├── Plan.js
│   │   ├── Product.js
│   │   ├── SaleItem.js
│   │   ├── SalesRecord.js
│   │   ├── Seller.js
│   │   ├── Settings.js
│   │   ├── ShopPayment.js
│   │   ├── Subscription.js
│   │   ├── SubscriptionPlan.js
│   │   └── User.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── companies.js
│   │   ├── kraviChat.js
│   │   ├── payments.js
│   │   ├── plans.js
│   │   ├── products.js
│   │   ├── reports.js
│   │   ├── sales.js
│   │   ├── sellers.js
│   │   ├── settings.js
│   │   ├── shopPayments.js
│   │   └── subscriptions.js
│   ├── services/
│   │   └── emailService.js
│   └── utils/
│       ├── azureBlob.js
│       ├── emailUtils.js
│       ├── multerConfig.js
│       ├── passwordUtils.js
│       ├── salesRecordUtils.js
│       └── subscriptionUtils.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── main.jsx
│   │   ├── api/
│   │   │   ├── axios.js
│   │   │   └── queryClient.js
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── KraviChatbot.jsx
│   │   │   ├── ManagerLayout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── NotificationBell.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── ReportFilter.jsx
│   │   │   ├── SalesTable.jsx
│   │   │   ├── SellerLayout.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── SubscriptionModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── data/
│   │   │   └── supportFaqs.js
│   │   ├── hooks/
│   │   │   ├── useAPIQuery.js
│   │   │   ├── useNotifications.js
│   │   │   ├── usePlans.js
│   │   │   └── useSubscriptionStatus.js
│   │   ├── images/
│   │   ├── pages/
│   │   │   ├── CURRENT_TASK.md
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── GoogleLoginButton.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── Admin/
│   │   │   │   ├── Companies.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Managers.jsx
│   │   │   │   ├── Payments.jsx
│   │   │   │   ├── Plans.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   └── Settings.jsx
│   │   │   ├── manager/
│   │   │   │   ├── AddSeller.jsx
│   │   │   │   ├── ManagerDashboard.jsx
│   │   │   │   ├── ManagerProfile.jsx
│   │   │   │   ├── ManagerRecords.jsx
│   │   │   │   ├── ManagerSellerDetail.jsx
│   │   │   │   ├── ProductsOverview.jsx
│   │   │   │   ├── Reports.jsx
│   │   │   │   ├── SubscriptionBilling.jsx
│   │   │   │   ├── SubscriptionPayment.jsx
│   │   │   │   └── components/
│   │   │   └── seller/
│   │   │       ├── AddProducts.jsx
│   │   │       ├── AddShop.jsx
│   │   │       ├── MyRecords.jsx
│   │   │       └── ...
│   │   └── utils/
│   │       ├── passwordUtils.js
│   │       └── recordsExport.js
```

## Getting Started

### Backend
1. Open a terminal in `backend/`
2. Install dependencies: `npm install`
3. Start the server: `npm run dev` or `node server.js`

### Frontend
1. Open a terminal in `frontend/`
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

## Notes
- `backend/` contains Express routes, Mongoose models, middleware, and utility services.
- `frontend/` contains a React + Vite application with pages for admin, managers, and sellers.
- Use the React context in `frontend/src/context/AuthContext.jsx` for authentication state.
