# Error Handling Guide

## 1. HTTP Errors
| Status | Meaning | Typical Cause |
|---|---|---|
| 400 | Validation or bad request | Missing required fields, invalid JSON |
| 401 | Unauthorized | Missing/invalid JWT |
| 403 | Forbidden | Wrong role or permission issue |
| 404 | Not found | Seller/profile/record missing |
| 402 | Payment required | Subscription inactive |
| 500 | Server error | Unexpected exception |

## 2. Validation Errors
The backend uses express-validator and returns errors in a standard shape:
```json
{
  "errors": [
    {
      "msg": "Password must be at least 6 characters",
      "param": "password"
    }
  ]
}
```

## 3. JWT Errors
- Missing token -> 401 with message `No authorization token, access denied`
- Invalid token -> 401 with message `Token is not valid`
- User no longer exists -> 401

## 4. MongoDB Errors
- Duplicate key -> 400 or 500 depending on route
- ObjectId validation errors -> 400 or 404 depending on context

## 5. Azure Errors
- Missing Azure configuration will crash startup if connection string is absent.
- Upload failures should be surfaced as friendly exceptions.
- Blob deletions are handled defensively and logged.

## 6. Permission Errors
- Wrong role returns 403 `Unauthorized, insufficient permissions`
- Seller not linked to manager returns 403

## 7. Timeouts
- Network timeouts should be handled with retry and user-friendly messaging.
- Use timeout wrappers around upload and request logic.

## 8. Offline Scenarios
The backend does not implement offline queueing. The Flutter app should:
- persist pending actions locally
- retry on reconnection
- show a clear offline banner
- avoid duplicate submissions
