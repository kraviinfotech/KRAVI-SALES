# Database Schema (MongoDB/Mongoose)

## Collections

### 1. Users (`users`)
Stores authentication credentials for both Managers and Sellers.
| Field | Type | Description |
|-------|------|-------------|
| `name` | String | Full name |
| `email` | String | Unique; Normalized |
| `mobile` | String | Unique; 10-digit |
| `password` | String | Hashed (Bcrypt) |
| `role` | String | 'manager' or 'seller' |
| `managerScannerPhoto`| String | Base64 (Only for managers) |
| `resetPasswordToken` | String | OTP for password recovery |
| `resetPasswordExpires`| Date | OTP expiry timestamp |

### 2. Sellers (`sellers`)
Profiles for sales representatives, linked to a User and a Manager.
| Field | Type | Description |
|-------|------|-------------|
| `userId` | ObjectId | Ref to `Users` |
| `managerId` | ObjectId | Ref to the owning `Manager` (User) |
| `name` | String | Display name |
| `mobile` | String | Contact number |
| `password` | String | Plain text (Manager-visible) |
| `monthlyTarget` | Number | Sales quota (used in reports) |

### 3. SalesRecords (`salesrecords`)
Top-level visit and transaction data.
| Field | Type | Description |
|-------|------|-------------|
| `sellerId` | ObjectId | Ref to `Sellers` |
| `managerId` | ObjectId | Ref to `Users` (for indexing) |
| `shopName` | String | Name of the visited shop |
| `shopAddress` | String | Physical address |
| `mobile` | String | Shop contact number |
| `landmark` | String | Nearby reference point |
| `shopType` | String | Retail/Wholesale/Distributor/Other |
| `totalAmount` | Number | Sum of all item amounts |
| `paidAmount` | Number | Amount collected during visit |
| `pendingAmount` | Number | Outstanding balance |
| `paymentStatus` | String | Paid/Partial/Pending |
| `scannerPhoto` | String | Base64 proof of payment |
| `visitDatetime` | Date | Timestamp of record creation |
| `location` | Object | `{ latitude, longitude }` |

### 4. SaleItems (`saleitems`)
Line items for a specific `SalesRecord`.
| Field | Type | Description |
|-------|------|-------------|
| `recordId` | ObjectId | Ref to `SalesRecords` |
| `productName` | String | Name of product |
| `quantity` | Number | Count (or Weight value) |
| `unit` | String | 'quantity' or 'weight' |
| `rate` | Number | Price per unit |
| `amount` | Number | `quantity * rate` |

## Relationships
- **1:N**: Manager -> Sellers.
- **1:N**: Seller -> SalesRecords.
- **1:N**: SalesRecord -> SaleItems.