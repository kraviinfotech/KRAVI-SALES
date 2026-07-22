# Backend Setup Guide

## 1. Runtime Requirements
- Node.js 18+ recommended
- npm 9+
- MongoDB instance reachable from the backend
- Azure Storage account
- SMTP account
- Razorpay credentials (optional for local testing but recommended)

## 2. Package Dependencies
The backend uses:
- express
- mongoose
- jsonwebtoken
- bcryptjs
- cors
- cookie-parser
- express-validator
- multer
- @azure/storage-blob
- nodemailer
- socket.io
- google-auth-library
- uuid

See [backend/package.json](../backend/package.json).

## 3. Installation
```bash
cd backend
npm install
```

## 4. Environment Variables
Create a local environment file with the values documented in [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).

Minimum practical variables:
```env
PORT=5002
MONGO_URI=mongodb://127.0.0.1:27017/salestracker
JWT_SECRET=change-me
AZURE_STORAGE_CONNECTION_STRING=your-azure-connection-string
AZURE_CONTAINER_NAME=product-images
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-user
SMTP_PASS=your-password
EMAIL_FROM=no-reply@example.com
RAZORPAY_KEY_ID=your-key
RAZORPAY_KEY_SECRET=your-secret
```

## 5. Running Locally
```bash
cd backend
npm run dev
```

The API will run on:
- HTTP: http://localhost:5002
- Health check: http://localhost:5002/health

## 6. Production Setup
- Set NODE_ENV=production
- Use secure secrets from the deployment environment
- Enable HTTPS and secure cookies
- Set CORS explicitly instead of wildcard origins
- Use managed MongoDB and Azure Storage credentials
- Run the app behind a process manager such as PM2 or container orchestration

## 7. Build and Start Commands
```bash
cd backend
npm start
npm run dev
```

## 8. MongoDB Notes
The backend expects a MongoDB connection string in MONGO_URI. The current implementation uses Mongoose schemas and creates indexes on the main collections.

## 9. Azure Notes
Azure Blob Storage is required for all uploaded images and scanner proofs. The integration is implemented in [backend/utils/azureBlob.js](../backend/utils/azureBlob.js).

## 10. Required External Services
- MongoDB
- Azure Blob Storage
- SMTP mail provider
- Razorpay (optional for subscription purchase flow, but required for the full payment checkout path)
- Optional Google OAuth credentials for Google login

## 11. Seeding and Test Data
The repository includes scripts such as:
- [backend/seed.js](../backend/seed.js)
- [backend/seedPlans.js](../backend/seedPlans.js)
- [backend/scripts/create-test-accounts.js](../backend/scripts/create-test-accounts.js)

These can be used to bootstrap local test accounts and subscriptions.
