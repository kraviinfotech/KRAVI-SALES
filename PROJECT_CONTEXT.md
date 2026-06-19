# Project Context: SalesFlow (KRAVI-SALES)

## Overview
SalesFlow is a specialized CRM and sales tracking application designed for field representatives (Sellers) and their supervisors (Managers). The system facilitates the recording of shop visits, order placement, and payment tracking in real-time, often in areas with variable connectivity.

## Business Purpose
To digitize the manual "order book" process for field sales, provide managers with real-time visibility into team performance, and maintain a master catalog of products and shop locations.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React (Icons), Recharts (Analytics).
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Communication**: Axios with interceptors for JWT injection.

## Architecture
- **Multi-Tenant Structure**: A `Manager` account is a root user. `Sellers` are created by and linked to a specific `Manager`. Data visibility is strictly siloed by `managerId`.
- **Frontend Architecture**: Layout-based routing. Data is shared via `OutletContext` in the `StartSelling` flow to maintain state across shop/product/review views.
- **Backend Architecture**: RESTful API with middleware-based authentication and role-based access control (RBAC).

## Key Folder Structure
- `/frontend/src/pages`: Feature-specific views.
- `/frontend/src/context`: Global state (Auth).
- `/frontend/src/components`: Reusable UI elements (SalesTable, ReportFilter).
- `/backend/routes`: API endpoint definitions grouped by resource.
- `/backend/models`: Mongoose schemas.
- `/backend/middleware`: Logic for `authMiddleware` and `roleMiddleware`.

## Authentication & Authorization
- **Flow**: User logs in with Email/Mobile + Password -> Server returns JWT -> Token stored in `localStorage` -> Axios interceptor adds `Authorization: Bearer <token>` to all requests.
- **Roles**:
  - `admin`: Super Admin. Can manage Manager accounts and monitor platform health.
  - `manager`: Can create sellers, view all reports, manage master product lists, and set default payment scanners.
  - `seller`: Can record shop visits, add products to orders, and view personal sales history.

## Important Design Decisions
- **Base64 Image Storage**: Payment proofs and shop images are currently stored as Base64 strings directly in MongoDB. (Assumption based on `routes/auth.js` and `routes/sales.js`).
- **State Persistence**: The `StartSelling` flow uses `sessionStorage` (`sellFormData`) to prevent data loss on page refreshes during the multi-step sales entry.
- **Multilingual Support**: Frontend components (`AddShop`, `AddProducts`) contain hardcoded translation objects for English, Hindi, and Marathi.

## Environment Variables
- `MONGODB_URI`: Connection string for the database.
- `JWT_SECRET`: Secret key for signing tokens.
- `PORT`: Backend server port (default 5000).