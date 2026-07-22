# Project Overview

## 1. Purpose
KRAVI-SALES is a role-based sales tracking and field operations platform for Indian sales teams. It supports three primary personas:
- Admin: manages companies, managers, plans, payments, and global settings.
- Manager: manages sellers, reviews sales records, monitors collections, and runs reports.
- Seller: checks in/out, visits shops, creates sales records, uploads images, and collects payments.

The backend is already implemented as a Node.js + Express + MongoDB service and is intended to be consumed by a Flutter-based seller application.

## 2. Core Technologies
- Runtime: Node.js
- Framework: Express.js
- Database: MongoDB via Mongoose
- Authentication: JWT + cookie-based auth + optional Google OAuth
- File storage: Azure Blob Storage
- Email: Nodemailer with SMTP
- Payments: Razorpay
- Real-time: Socket.IO
- Validation: express-validator
- File upload: Multer

## 3. Backend Architecture
The backend follows a modular route-based architecture:
- Entry point: [backend/server.js](../backend/server.js)
- Routes: [backend/routes](../backend/routes)
- Middleware: [backend/middleware](../backend/middleware)
- Models: [backend/models](../backend/models)
- Utilities: [backend/utils](../backend/utils)
- Services: [backend/services](../backend/services)

Request flow:
1. Client sends HTTP request.
2. Middleware validates authentication, role, and subscription.
3. Route handler performs business logic.
4. Mongoose model persists or reads data.
5. Azure Blob, email, Razorpay, or Socket.IO may be invoked.
6. Standard JSON response is returned.

## 4. User Roles
| Role | Primary Responsibilities |
|---|---|
| Admin | Manage managers, plans, payments, settings, companies |
| Manager | Create sellers, view reports, monitor collections, manage subscriptions |
| Seller | Check in/out, visit shops, capture sales, upload proof, collect payments |

## 5. Main Modules
- Authentication and authorization
- Seller management
- Attendance tracking
- Sales recording
- Payments and collections
- Product catalog management
- Subscription and plan management
- Reports and analytics
- Notifications
- Image uploads
- Calls and chat support

## 6. Feature Overview
- Login, logout, password reset, Google login
- Seller onboarding through OTP and manager approval
- Daily attendance with GPS check-in/check-out
- Sales record creation with GPS, images, and payment data
- Product-based item entry and totals
- Payment collection with pending/paid status
- Manager dashboards and collection summaries
- Reports: weekly, monthly, yearly, shop-wise, product-wise, attendance
- Subscription and Razorpay checkout
- Azure image storage
- Notification creation for managers
- Chatbot support endpoint

## 7. Deployment Assumptions
- MongoDB Atlas or self-hosted MongoDB instance
- Azure Storage account for images
- SMTP account for email
- Razorpay credentials for subscriptions
- A reverse proxy or container runtime for production deployment
- Environment variables injected securely

## 8. Flutter Alignment Notes
The Flutter Seller App should treat the backend as the source of truth for:
- Authentication state
- Seller profile linkage
- Attendance status
- Sales record lifecycle
- Image upload and URL resolution
- Payment collection workflow
- Subscription gating

> When the backend behavior is ambiguous, the Flutter app should follow the existing frontend patterns and expect the API to be authoritative.
