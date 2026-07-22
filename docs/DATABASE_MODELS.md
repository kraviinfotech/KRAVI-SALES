# Database Models

## 1. User
Collection: users

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | String | Yes | - | User display name |
| email | String | Yes | - | Unique, lowercased |
| mobile | String | Yes | - | Unique |
| password | String | Yes | - | Hashed before save |
| role | String | Yes | - | admin, manager, seller |
| managerScannerPhoto | String | No | null | Azure blob name |
| photo | String | No | null | Optional profile image |
| designation | String | No | Manager | Manager title |
| company | ObjectId | No | null | Reference to Company |
| isActive | Boolean | No | true | Account state |
| subscriptionTier | String | No | null | Display tier |
| subscriptionExpiry | Date | No | null | Expiry date |
| loginHistory | Array | No | [] | Login audit |
| termsAccepted | Boolean | No | false | Terms acceptance |

### Relationships
- One user can own a Seller profile via Seller.userId.
- Managers are linked to subscriptions and sales records.

### Usage
Used throughout auth, manager management, subscription checks, and seller ownership.

## 2. Seller
Collection: sellers

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| userId | ObjectId | Yes | - | Ref User |
| managerId | ObjectId | Yes | - | Ref User |
| name | String | Yes | - | Seller display name |
| mobile | String | Yes | - | Seller phone |
| password | String | No | null | Stored for admin-facing compatibility |
| monthlyTarget | Number | No | 100000 | Used in reports |
| createdAt | Date | No | Date.now | |

### Relationships
- Belongs to one manager.
- Links the authenticated seller account to the seller profile used in sales records.

### Usage
Used for seller creation, manager-seller relations, attendance, and location lookup.

## 3. SalesRecord
Collection: salesrecords

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| sellerId | ObjectId | Yes | - | Ref Seller |
| managerId | ObjectId | Yes | - | Ref User |
| shopName | String | Yes | - | Shop name |
| shopAddress | String | Yes | - | Shop address |
| landmark | String | No | - | Optional |
| shopType | String | Yes | - | Retail/Wholesale/Distributor/Other |
| latitude | Number | Yes | - | GPS latitude |
| longitude | Number | Yes | - | GPS longitude |
| visitDatetime | Date | Yes | - | Visit time |
| totalAmount | Number | Yes | 0 | Sum of items |
| checkInTime | Date | No | - | Optional |
| checkOutTime | Date | No | - | Optional |
| paymentMethod | String | No | Cash | Online/Offline/Cash |
| paidAmount | Number | No | 0 | |
| pendingAmount | Number | No | 0 | |
| paymentStatus | String | No | Pending | Paid/Partial/Pending |
| scannerPhoto | String | No | null | Azure blob name |
| shopImage | String | No | null | Azure blob name |
| createdAt | Date | No | Date.now | |

### Indexes
- sellerId + managerId + visitDatetime
- managerId + visitDatetime

### Usage
Core sales record entity. Used in reports, payments, and seller history.

## 4. SaleItem
Collection: saleitems

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| recordId | ObjectId | Yes | - | Ref SalesRecord |
| productName | String | Yes | - | |
| unit | String | No | quantity | quantity or weight |
| quantity | Number | Yes | - | |
| weight | Number | No | null | |
| price | Number | No | null | |
| rate | Number | Yes | - | |
| amount | Number | Yes | - | |

### Usage
Represents line items inside a sales record.

## 5. Attendance
Collection: attendances

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| sellerId | ObjectId | Yes | - | Ref Seller |
| managerId | ObjectId | Yes | - | Ref User |
| date | Date | Yes | - | Day bucket |
| loginTime | Date | Yes | - | Check-in time |
| logoutTime | Date | No | null | Check-out time |
| totalWorkingHours | Number | No | 0 | Calculated |
| checkInLocation | Object | No | - | lat/lng/accuracy |
| checkOutLocation | Object | No | - | lat/lng/accuracy |
| status | String | No | Checked In | Checked In/Checked Out |

### Usage
Tracks daily seller attendance and working hours.

## 6. Subscription
Collection: subscriptions

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| managerId | ObjectId | Yes | - | Ref User |
| planId | ObjectId | Yes | - | Ref Plan |
| startDate | Date | Yes | - | |
| endDate | Date | Yes | - | |
| status | String | No | active | active/expired/cancelled/pending |
| isTrial | Boolean | No | false | |
| paymentId | ObjectId | No | - | Ref Payment |
| provider | String | No | system | |

### Usage
Controls access to the app and seller creation limits.

## 7. Plan
Collection: plans

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | String | Yes | - | |
| description | String | No | '' | |
| price | Number | No | 0 | |
| currency | String | No | INR | |
| durationMonths | Number | No | 3 | |
| durationDays | Number | No | 0 | |
| managers | String | No | 5 | |
| maxSellers | Number | No | 0 | |
| storageGb | Number | No | 2 | |
| features | Array | No | [] | |
| isTrial | Boolean | No | false | |
| displayOrder | Number | No | 0 | |
| isActive | Boolean | No | true | |

### Usage
Used to define subscription plans and seller limits.

## 8. Payment
Collection: payments

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| managerId | ObjectId | Yes | - | Ref User |
| subscriptionId | ObjectId | No | - | Ref Subscription |
| amount | Number | Yes | - | |
| currency | String | No | INR | |
| provider | String | Yes | - | razorpay |
| transactionId | String | Yes | - | Unique |
| razorpayOrderId | String | No | - | |
| razorpayPaymentId | String | No | - | |
| razorpaySignature | String | No | - | |
| status | String | No | pending | pending/success/failed |
| failureReason | String | No | - | |
| metadata | Mixed | No | - | |
| invoiceUrl | String | No | - | |

### Usage
Tracks Razorpay subscription payments and billing state.

## 9. ShopPayment
Collection: shoppayments

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| salesRecordId | ObjectId | Yes | - | Ref SalesRecord |
| shopName | String | Yes | - | |
| amount | Number | Yes | - | |
| mode | String | Yes | - | Cash or Online |
| paymentPhoto | String | No | null | Optional proof |
| txnId | String | No | '' | |
| remarks | String | No | '' | |
| sellerId | ObjectId | Yes | - | Ref Seller |
| managerId | ObjectId | Yes | - | Ref User |
| createdAt | Date | No | Date.now | |

### Usage
Captures collection events made by sellers against a sales record.

## 10. Notification
Collection: notifications

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| managerId | ObjectId | Yes | - | Ref User |
| title | String | Yes | - | |
| message | String | Yes | - | |
| type | String | No | payment | |
| read | Boolean | No | false | |
| data | Mixed | No | - | Extra payload |
| createdAt | Date | No | Date.now | |

### Usage
Used for manager-facing payment notifications.

## 11. Product
Collection: products

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | String | Yes | - | |
| managerId | ObjectId | Yes | - | Ref User |
| category | String | No | General | |
| baseRate | Number | No | 0 | |
| createdAt | Date | No | Date.now | |

### Usage
Catalog of products managed by managers.

## 12. Company
Collection: companies

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| name | String | Yes | - | |
| ownerName | String | No | - | |
| email | String | No | - | |
| phone | String | No | - | |
| logo | String | No | - | |
| gstNumber | String | No | - | |
| address | String | No | - | |
| plan | String | No | Basic | |
| status | String | No | Active | |

### Usage
Admin-facing company records.

## 13. Settings
Collection: settings

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| appName | String | No | KRAVI SaaS | |
| trialDays | Number | No | 14 | |
| smtpHost | String | No | '' | |
| smtpPort | String | No | '' | |
| smtpUser | String | No | '' | |
| paymentKeyId | String | No | '' | |
| paymentKeySecret | String | No | '' | |
| notifications | Object | No | - | Feature toggles |

### Usage
Stores admin-configurable global settings.

## 14. CallLog
Collection: calllogs

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| tenantId | ObjectId | Yes | - | Ref User |
| caller | Object | Yes | - | participant schema |
| receiver | Object | Yes | - | participant schema |
| callType | String | No | voice | voice/video/screen |
| status | String | No | missed | completed/missed/rejected/failed |
| startedAt | Date | No | - | |
| endedAt | Date | No | - | |
| durationSeconds | Number | No | 0 | |

### Usage
Supports call history and telephony integration for managers and sellers.
