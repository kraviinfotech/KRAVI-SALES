# Current Task: Admin Authentication & Role Management

## Objective
Implement the three-tier SaaS hierarchy (Admin > Manager > Seller), update route protection, and finalize the role-based redirection from a shared login page.

## Files Involved
- `backend/routes/auth.js`
- `backend/models/User.js`
- `frontend/src/pages/Login.jsx`
- `backend/middleware/roleMiddleware.js`

## Dependencies
None.

## Remaining Steps
1. [x] **Update User Model**: Include `admin` in role enum.
2. [x] **Remove Public Registration**: Delete public `/register` endpoint to prevent self-registration.
3. [x] **Update Login Redirection**: Allow admins to login via Manager page and redirect to `/admin`.
4. [x] **Seed Script**: Create `seedAdmin.js` to create the initial Super Admin account.
5. [x] **Admin Dashboards**: Create basic scaffolding for `/admin` routes and views.
6. [x] **Frontend Route Protection**: Implement `ProtectedRoute` for RBAC.
7. [ ] **Admin-Only Routes**: Implement backend routes for Admins to create and manage Managers.

## Testing Checklist
- [x] Public registration is disabled.
- [x] Seller cannot login via Manager tab.
- [x] Manager redirected to `/manager`.
- [x] Admin redirected to `/admin` when using Manager login tab.
- [ ] Route Guard: Verify Seller/Manager cannot access `/admin` even if URL is typed manually.