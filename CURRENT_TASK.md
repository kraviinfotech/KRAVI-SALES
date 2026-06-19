# Current Task: Subscription & Monetization Integration

## Objective
Transition the application into a SaaS model by implementing subscription-based access for Manager accounts and integrating a payment flow.

## Files Involved
- `backend/routes/auth.js`
- `backend/models/User.js`
- `frontend/src/pages/Login.jsx`
- `backend/middleware/roleMiddleware.js`
 - `frontend/src/components/SubscriptionModal.jsx`
 - `frontend/src/components/PricingCard.jsx`

## Dependencies
 - `framer-motion` (for modal animations)

## Remaining Steps
1. [x] **Update User Model**: Include `admin` in role enum.
2. [x] **Remove Public Registration**: Delete public `/register` endpoint to prevent self-registration.
3. [x] **Update Login Redirection**: Allow admins to login via Manager page and redirect to `/admin`.
4. [x] **Seed Script**: Create `seedAdmin.js` to create the initial Super Admin account.
5. [x] **Admin Dashboards**: Create basic scaffolding for `/admin` routes and views.
6. [x] **Frontend Route Protection**: Implement `ProtectedRoute` for RBAC.
7. [x] **Premium Subscription Modal**: Design and implement a premium 3-tier pricing modal for Managers.
8. [ ] **Subscription Backend**: Add fields to `User` model to track `subscriptionTier` and `subscriptionExpiry`.
9. [ ] **Payment Integration**: Implement backend logic and frontend forms for Stripe/Razorpay integration.
10. [ ] **Admin Management**: Finalize backend routes for Admins to manage Manager subscriptions manually.

## Testing Checklist
- [x] Public registration is disabled.
- [x] Seller cannot login via Manager tab.
- [x] Manager redirected to `/manager`.
- [x] Admin redirected to `/admin` when using Manager login tab.
 - [x] Subscription Modal: Verified to appear only for Managers without active plans.
 - [ ] Route Guard: Verify Seller/Manager cannot access `/admin` even if URL is typed manually.