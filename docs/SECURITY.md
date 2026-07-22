# Security Notes

## 1. JWT
- JWT is issued on login and Google login.
- The token is stored in a cookie named token and can also be sent in the Authorization header.
- Token expiry depends on subscription status and role.

## 2. Authorization
Protected routes rely on:
- authMiddleware for authentication
- roleMiddleware for role checks
- subscriptionMiddleware for active subscription checks

## 3. Password Hashing
Passwords are hashed with bcrypt before save using the pre-save hook in the User model.

## 4. Role Validation
- Managers and sellers are differentiated by the role field.
- Subscription access is checked per manager context.

## 5. Sensitive APIs
Sensitive operations include:
- password reset
- seller creation
- subscription checkout
- manager scanner upload
- payment collection

These should be protected by authentication and role checks.

## 6. Refresh Logic
The backend does not implement refresh tokens. Instead, it issues a long-lived JWT and relies on re-login or re-authentication when the token expires.

## 7. Headers
For API requests, prefer:
- Authorization: Bearer <token>
- Content-Type: application/json or multipart/form-data

## 8. Flutter Security Recommendations
- Store token in secure storage.
- Clear token on logout.
- Avoid exposing secrets in app logs.
- Never persist raw passwords.
