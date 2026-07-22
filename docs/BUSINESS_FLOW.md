# Business Flow

## 1. Seller Login Flow
```text
Open App
↓
Enter email/mobile + password
↓
Backend validates credentials
↓
JWT issued
↓
Subscription status checked
↓
Dashboard loaded
```

### Notes
- Login may also use Google OAuth.
- A locked account returns 403.
- Expired subscriptions return 402.

## 2. Attendance Flow
```text
Seller opens Attendance
↓
Check-in with GPS coordinates
↓
Backend creates Attendance document
↓
Seller can later check out
↓
Backend computes working hours
```

### Key behavior
- Daily check-in is limited to once per day.
- Check-out requires a prior check-in.
- GPS coordinates and accuracy are stored.

## 3. Shop Visit Flow
```text
Seller opens sales flow
↓
Enters shop details
↓
Adds products
↓
Captures GPS location
↓
Uploads shop image / scanner photo
↓
Saves sales record
```

## 4. Sales Submission Flow
```text
Fill shop details
↓
Add items
↓
Calculate total amount
↓
Choose payment method
↓
Upload proof if online
↓
Submit record
↓
Persist SalesRecord and SaleItems
```

## 5. Payments Flow
```text
Seller creates a sales record
↓
Record has pending amount
↓
Seller collects payment
↓
Backend creates ShopPayment entry
↓
SalesRecord paidAmount/pendingAmount updated
↓
Manager notification emitted
```

## 6. Notification Flow
```text
Seller records payment
↓
Backend creates Notification for manager
↓
Manager sees recent payments and unread count
↓
Manager marks notifications read
```

## 7. Subscription Flow
```text
Manager selects plan
↓
Backend creates Razorpay order
↓
Manager completes payment
↓
Backend verifies signature
↓
Subscription becomes active
↓
App access becomes enabled
```

## 8. Manager Approval Flow
```text
Manager invites seller via OTP
↓
Seller account created after verification
↓
Seller linked to manager via Seller.managerId
↓
Seller can now use the app within subscription limits
```

## 9. Profile Flow
```text
User opens profile
↓
Fetches current user info
↓
Manager may upload scanner photo
↓
Backend stores image in Azure Blob
↓
Resolved URL returned for front-end use
```

## 10. Logout Flow
```text
User taps logout
↓
Backend clears token cookie
↓
Client clears local session state
↓
User is redirected to login screen
```

## 11. Reporting Flow
```text
Manager opens reports
↓
Backend aggregates sales data by date, shop, product, seller, and payment status
↓
Response is returned as JSON
↓
Flutter UI displays charts and tables
```

## 12. Inferred Flutter Behavior
The Flutter app should mirror these flows closely:
- login and token handling
- attendance and GPS capture
- multi-step sales creation
- image upload before final submission
- payment collection and pending amount updates
- manager-side review screens and reports
