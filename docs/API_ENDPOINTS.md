# API Endpoints Summary

## Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/google
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/logout
- GET /api/auth/me

## Sales
- POST /api/sales
- GET /api/sales
- GET /api/sales/:id
- PUT /api/sales/:id
- DELETE /api/sales/:id
- GET /api/sales/summary

## Attendance
- POST /api/attendance/checkin
- POST /api/attendance/checkout
- GET /api/attendance/current
- GET /api/attendance/history

## Products
- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

## Payments
- GET /api/payments
- POST /api/payments
- GET /api/payments/:id
- PUT /api/payments/:id

## Shop Payments
- GET /api/shopPayments
- POST /api/shopPayments
- PUT /api/shopPayments/:id

## Subscriptions
- GET /api/subscriptions
- POST /api/subscriptions
- POST /api/subscriptions/verify
- GET /api/subscriptions/plans

## Reports
- GET /api/reports/summary
- GET /api/reports/sellers
- GET /api/reports/collections

## Admin
- GET /api/admin/dashboard
- GET /api/admin/sellers
- PUT /api/admin/sellers/:id

## Sellers
- GET /api/sellers
- POST /api/sellers
- PUT /api/sellers/:id

## Companies / Settings
- GET /api/companies
- PUT /api/settings

## Notes for Flutter
Use the base URL from the backend environment and add JWT in the Authorization header when required.
