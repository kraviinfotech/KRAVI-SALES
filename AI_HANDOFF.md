# AI Handoff: Current State

## **MASTER CONTEXT FILE**
This document serves as the primary entry point and master context file for any AI assistant or developer working on the SalesFlow project. It provides a high-level overview, current status, and directs to other detailed documentation.

## Current Project Status
The application is a functional MVP. Authentication and core sales tracking are stable. Currently integrating SaaS monetization features, specifically Manager-tier subscriptions.

## Core Documentation Links
For detailed information, please refer to the following documents:
- [Project Context](/docs/PROJECT_CONTEXT.md): High-level overview, business purpose, tech stack, architecture, and design decisions.
- [Database Schema](/docs/DATABASE_SCHEMA.md): Detailed breakdown of all MongoDB collections, fields, types, and relationships.
- [API Documentation](/docs/API_DOCUMENTATION.md): Comprehensive list of all backend endpoints, request/response formats, and authentication requirements.

## Completed Features
- Scanner Proof Feature
- Manager-Seller Data Isolation
- Dual-role Dashboard (Manager/Seller).
- Multi-step sales entry with geolocation capture.
- Real-time analytics charts using Recharts.
- Automatic Scanner Modal: Opens when "Online" payment is selected; allows using manager's default image or capturing a new one.
- Admin Panel Scaffolding.
- Frontend Role-Based Access Control (ProtectedRoute).
- Password Reset flow with OTP (currently logged to console in dev).
 - **Premium Subscription Modal**: A modern, high-conversion UI for managers to choose plans (Free, 3 Months, 1 Year).

## Pending Features / Technical Debt
- **Admin Role (In Progress)**: Implementation of Super Admin dashboard and Manager management.
- **Registration Policy Enforcement**: Public self-registration has been removed. Seed script for first admin is required.
- **Image Storage**: (High Priority) Moving from Base64 in MongoDB to Cloudinary.
- **Master Catalog Management**: Managers can add/delete products, but Sellers' autocomplete only partially uses this list.
- **Attendance Module**: Referenced in `reports.js` but the model/logic is not yet fully implemented.
- **Input Validation**: Frontend validation is basic; relies heavily on backend `express-validator`.
- **Schema Mismatch**: `SalesRecord.js` model is missing fields (managerId, address) that the logic currently writes to the database.
 - **Subscription Persistence**: The subscription status is currently hardcoded as `false` in the frontend; needs backend integration.

## Important Files & Purposes
- `frontend/src/api/axios.js`: Centralized API client with auth headers.
- `frontend/src/pages/ReviewSave.jsx`: Contains the complex logic for total calculation and the scanner modal.
- `backend/routes/reports.js`: Heavy use of MongoDB Aggregation pipelines.
- `SCANNER_FEATURE_GUIDE.md`: Detailed technical breakdown of the payment proof feature.
 - `frontend/src/components/SubscriptionModal.jsx`: "Smart" modal that auto-triggers for Managers using `sessionStorage`.

## Development Workflow
1. Backend runs on `http://localhost:5000`.
2. Frontend runs on Vite default port.
3. Use `localStorage` to inspect the `user` object and `token`.

## Notes for Future AI
- **Admin Login**: Admins use the Manager Login Page. The frontend redirects `admin` role to `/admin`.
- **No Self-Registration**: Public registration is disabled. Users must be created by their superior (Admin -> Manager -> Seller).
- **Localization**: When adding new fields to `AddShop` or `AddProducts`, you MUST update the `translations` object at the top of the file to maintain EN/HI/MR support.
- **Z-Index**: The Scanner Modal in `ReviewSave` uses `z-50`. Ensure any new modals do not conflict.
 - **Modal Persistence**: `SubscriptionModal` uses `sessionStorage` to ensure it only appears once per login session for managers.
- **Multi-Tenancy**: Always ensure `managerId` is included when querying `SalesRecords` or `Sellers` in the backend.
- **FormData**: `ReviewSave.jsx` now uses `FormData` for posts to `/sales/record` to support future file uploads.