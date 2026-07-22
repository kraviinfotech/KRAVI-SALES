# API Reference

This document summarizes every backend route exposed by the service. The Flutter app should treat these endpoints as the backend contract.

## 1. Base URL
- Local: http://localhost:5002
- API prefix: /api

## 2. Authentication Conventions
- Most routes require a JWT in the Authorization header or cookie named token.
- The auth middleware reads the token from the cookie first and falls back to the Bearer header.
- On auth failure, the backend returns 401 with a message.

## 3. Route Inventory

### Auth Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/auth/register | Public manager registration |
| POST | /api/auth/send-registration-otp | Send registration OTP |
| POST | /api/auth/verify-registration-otp | Verify registration OTP |
| POST | /api/auth/login | Login with email/mobile |
| POST | /api/auth/google | Google sign-in |
| POST | /api/auth/forgot-password | Password reset OTP |
| POST | /api/auth/reset-password | Reset password |
| GET | /api/auth/me | Fetch current user |
| POST | /api/auth/accept-terms | Accept terms |
| PATCH | /api/auth/me/scanner | Upload manager scanner image |
| GET | /api/auth/manager-scanner | Fetch manager scanner image |
| GET | /api/auth/debug-user | Dev-only user lookup |
| GET | /api/auth/test-email | Dev-only email test |
| POST | /api/auth/logout | Logout |

### Seller Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/sellers/send-otp | Send seller creation OTP |
| POST | /api/sellers/verify-otp | Verify seller creation OTP |
| POST | /api/sellers | Create seller account |
| GET | /api/sellers | List sellers |
| GET | /api/sellers/:id | Get seller details |
| GET | /api/sellers/:id/location | Fetch latest known seller location |
| PATCH | /api/sellers/:id/password | Change seller password |

### Sales Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/sales/record | Create sales record |
| GET | /api/sales/today-stats | Get today summary |
| GET | /api/sales/my-records | Get seller history |

### Attendance Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/attendance/checkin | Seller check in |
| POST | /api/attendance/checkout | Seller check out |
| GET | /api/attendance/today | Current attendance status |
| GET | /api/attendance/history | Attendance history |
| GET | /api/attendance/manager | Manager attendance overview |

### Product Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/products | List products |
| POST | /api/products | Create product |
| DELETE | /api/products/:id | Delete product |

### Reports Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| DELETE | /api/reports/clear-all | Delete all manager records |
| DELETE | /api/reports/seller-records/:sellerId | Delete seller records |
| DELETE | /api/reports/purge-unknown | delete orphaned records |
| POST | /api/reports/manager-record | Create manager-managed record |
| GET | /api/reports/summary | Summary metrics |
| GET | /api/reports/weekly | Weekly revenue |
| GET | /api/reports/monthly | Monthly revenue |
| GET | /api/reports/today | Today revenue |
| GET | /api/reports/shop-wise | Shop-wise report |
| GET | /api/reports/product-wise | Product-wise report |
| GET | /api/reports/location | Location report |
| GET | /api/reports/payments | Payment status report |
| GET | /api/reports/target-achievement | Target achievement |
| GET | /api/reports/attendance | Attendance report |
| GET | /api/reports/yearly | Yearly revenue |
| GET | /api/reports/sellers-performance | Seller performance |
| GET | /api/reports/records | Filtered records list |

### Subscription and Payment Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/subscriptions/plans | List plans |
| GET | /api/subscriptions/my-status | Current subscription status |
| POST | /api/subscriptions/checkout/order | Create Razorpay order |
| POST | /api/subscriptions/checkout/verify | Verify payment |
| GET | /api/subscriptions/history | Payment history |
| POST | /api/shoppayments/receive | Record payment collection |
| GET | /api/shoppayments/manager-recent | Recent collections |
| GET | /api/shoppayments/manager-collections | Paginated collections |
| GET | /api/shoppayments/notifications | Manager notifications |
| PUT | /api/shoppayments/notifications/read | Mark notifications read |

### Admin Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/admin/overview | Admin summary |
| GET | /api/admin/managers | List managers |
| PATCH | /api/admin/managers/:id/unlock | Unlock manager |
| PATCH | /api/admin/managers/:id | Update manager |
| DELETE | /api/admin/managers/:id | Delete manager |
| POST | /api/admin/reset-manager-password | Reset manager password |
| GET | /api/companies | List companies |
| GET | /api/companies/:id | Get company |
| POST | /api/companies | Create company |
| PATCH | /api/companies/:id | Update company |
| DELETE | /api/companies/:id | Delete company |
| GET | /api/plans | List plans |
| POST | /api/plans | Create plan |
| PATCH | /api/plans/:id | Update plan |
| DELETE | /api/plans/:id | Delete plan |
| GET | /api/payments | List payment summary |
| GET | /api/settings | Fetch settings |
| PUT | /api/settings | Update settings |

### Communication and Support Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/kravi-chat | Chatbot support |
| GET | /api/calls/contacts | Call contacts |
| GET | /api/calls/history | Call history |
| GET | /api/calls/stats | Call stats |
| GET | /health | Health check |

## 4. Detailed Endpoint Notes

### POST /api/auth/login
- Authentication: No
- Headers: Content-Type application/json
- Request body:
```json
{
  "email": "seller@example.com",
  "mobile": "",
  "password": "secret123"
}
```
- Response 200:
```json
{
  "user": {
    "_id": "...",
    "name": "Seller Name",
    "email": "seller@example.com",
    "role": "seller"
  },
  "token": "jwt-token",
  "subscriptionStatus": {
    "status": "active",
    "canUseApp": true
  }
}
```
- Errors: 400 invalid credentials, 403 locked account, 401 invalid token
- Business logic: validates credentials, logs login history, issues JWT, writes cookie
- Related models: User, Seller, Subscription
- Flutter screen: Login

### POST /api/sales/record
- Authentication: Yes, seller role
- Headers: Content-Type multipart/form-data
- Multipart fields:
  - shopName: string
  - shopAddress: string
  - mobile: string
  - landmark: string
  - shopType: Retail|Wholesale|Distributor|Other
  - latitude: number
  - longitude: number
  - items: JSON string, array of items
  - paymentMethod: Online|Offline|Cash
  - paidAmount: number
  - pendingAmount: number
  - paymentStatus: Paid|Partial|Pending
  - shopImage: image file
  - scannerPhoto: image file
  - checkInTime, checkOutTime: ISO date strings (optional)
- Response 201: created record, items, uploaded image references
- Errors: 400 validation, 403 seller not linked to manager, 402 subscription inactive
- Related models: SalesRecord, SaleItem, Seller, User
- Flutter screen: Sales recording flow

### POST /api/attendance/checkin
- Authentication: Yes, seller role
- Request body:
```json
{
  "latitude": 19.45,
  "longitude": 72.87,
  "accuracy": 15
}
```
- Response 201: attendance document
- Errors: 400 already checked in today, 404 seller profile missing
- Related models: Attendance, Seller
- Flutter screen: Attendance check-in

### GET /api/attendance/today
- Authentication: Yes, seller role
- Response: current day attendance state
- Flutter screen: Attendance screen

### GET /api/sales/my-records
- Authentication: Yes, seller role
- Response: all seller records with items and resolved image URLs
- Flutter screen: My Records

### POST /api/shoppayments/receive
- Authentication: Yes, seller role
- Request body:
```json
{
  "salesRecordId": "...",
  "amount": 200,
  "mode": "Cash",
  "txnId": "",
  "remarks": "",
  "paymentPhoto": null
}
```
- Response 201: ShopPayment and updated SalesRecord
- Related models: ShopPayment, SalesRecord, Notification
- Flutter screen: Payment collection

### GET /api/reports/records
- Authentication: Yes, manager role
- Query params: sellerId, from, to, shopType, shopName, status, sellerName
- Response: list of records with items and images
- Flutter screen: Manager records/reporting

### GET /api/subscriptions/my-status
- Authentication: Yes
- Response: subscription status, plan, days remaining, seller limit
- Flutter screen: Subscription screen

### GET /api/health
- Authentication: No
- Response: server health status

## 5. Notes for Flutter Implementation
- Use multipart/form-data for sales record image upload.
- Resolve image URLs from the backend response.
- Expect 402 for subscription blockers.
- Expect 401 for expired or missing tokens.
- Use the returned token and store it securely.
