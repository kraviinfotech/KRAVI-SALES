# Authentication Guide

## 1. Login Flow
The backend accepts login via:
- email + password
- mobile + password
- Google ID token via /api/auth/google

## 2. JWT
On successful login, the backend issues a JWT and returns it in the response body and sets it as the cookie named token.

## 3. Logout
The backend clears the token cookie on /api/auth/logout.

## 4. Token Storage
The Flutter app should store the JWT securely (for example using `flutter_secure_storage`) and send it in the Authorization header for protected requests.

## 5. Token Expiry
Token expiration is based on role and subscription status. Managers and sellers receive subscription-based expiry windows, while admin tokens are long-lived.

## 6. Protected APIs
The following routes require auth:
- all seller routes
- attendance routes
- reports routes
- payments/subscription routes for relevant users
- profile and scanner endpoints

## 7. Flutter Authentication Flow
```text
App starts
↓
Check secure storage for token
↓
If token exists, call /api/auth/me
↓
If valid, unlock app
↓
If invalid, clear token and show login
```

## 8. Password Reset
The backend supports:
- /api/auth/forgot-password
- /api/auth/reset-password

## 9. Terms Acceptance
The backend stores terms acceptance metadata on the User model. The app should ensure the terms flow is completed before full access if required by product design.
