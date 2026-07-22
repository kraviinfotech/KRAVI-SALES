# Response Formats

## 1. Success Response Shape
Most successful JSON responses follow this pattern:
```json
{
  "message": "Operation completed successfully",
  "data": {}
}
```

For resource creation routes, the response often returns the created entity directly:
```json
{
  "message": "Sales record saved successfully",
  "record": {
    "_id": "...",
    "shopName": "Sample Shop"
  },
  "items": []
}
```

## 2. Authentication Success Response
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

## 3. Failure Response Shape
```json
{
  "message": "Incorrect password"
}
```

## 4. Validation Error Shape
```json
{
  "errors": [
    {
      "msg": "Shop name is required",
      "param": "shopName"
    }
  ]
}
```

## 5. Authentication Error Shape
```json
{
  "message": "No authorization token, access denied"
}
```

## 6. Subscription Error Shape
```json
{
  "code": "SUBSCRIPTION_REQUIRED",
  "message": "Your subscription has expired. Please renew your plan to continue using SalesFlow."
}
```

## 7. Data Response Examples
### Attendance
```json
{
  "checkedIn": true,
  "attendance": {
    "_id": "...",
    "status": "Checked In"
  }
}
```

### Reports Summary
```json
{
  "totalSellers": 4,
  "totalRecords": 25,
  "monthlyTotal": 125000,
  "yearlyTotal": 1500000,
  "totalPending": 5000
}
```

### Manager Collections
```json
{
  "collections": [],
  "pagination": {
    "total": 0,
    "page": 1,
    "pages": 0
  }
}
```
