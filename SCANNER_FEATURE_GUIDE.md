# Scanner Payment Proof Feature Guide

## Overview
This feature allows managers to upload a default payment receipt image which sellers can use when making online payments. Sellers can either use the manager's uploaded receipt or capture their own payment proof.

---

## How It Works

### 1. **Manager Uploads Scanner (Profile)**
- **Location**: Manager Profile Page (`/profile`)
- **Steps**:
  1. Go to Manager Profile
  2. Scroll to "Default Scanner Proof" section
  3. Click "Upload Scanner" button
  4. Select or capture a payment receipt image
  5. Image is automatically saved and will be available to all sellers

**Backend Endpoint**: `PATCH /api/auth/me/scanner`

---

### 2. **Seller Uses Scanner During Payment (ReviewSave)**
- **Location**: Review Save Record Page (before saving a sales record)
- **Steps**:
  1. Seller fills in all sale details (products, amounts, etc.)
  2. In "Payment Method" dropdown, selects "Online" instead of "Cash"
  3. **Scanner modal automatically opens** showing:
     - Manager's default payment receipt (if uploaded)
     - Option to "Use This Receipt" (pre-filled)
     - Option to "Capture Your Own Proof" (camera)
  4. Seller chooses one option:
     - Click "Use This Receipt" → Uses manager's image automatically
     - Click "Capture Your Own Proof" → Opens camera to take photo
  5. Click "Confirm" to use selected image
  6. Save the record - payment proof image is saved with the sale

**Backend Endpoint**: `GET /api/auth/manager-scanner`

---

## Technical Implementation

### Frontend Components

#### ManagerProfile.jsx
```javascript
// State Management
- managerScannerPhoto: Stores manager's uploaded scanner image (base64)
- scannerLoading: Loading state during upload/removal
- scannerMessage: Feedback messages to user

// Key Functions
- handleScannerUpload(): Converts image to base64 and uploads via API
- handleRemoveScanner(): Removes the uploaded scanner image
- fetchManagerScanner(): Loads current scanner image on page load

// UI Elements
- Upload Scanner button
- Preview of current scanner image
- Update/Remove buttons
- Status messages
```

#### ReviewSave.jsx
```javascript
// State Management
- showScanner: Controls modal visibility (opens when payment method = "Online")
- scannerPhoto: Seller's captured/selected payment proof
- defaultScannerPhoto: Manager's uploaded scanner image
- fileInputRef: Reference to file input for camera capture

// Key Functions
- loadDefaultScanner(): Fetches manager's scanner from API
- handlePhotoCapture(): Handles camera capture or file selection
- Automatic modal opening when Online payment is selected

// Modal Logic
- Shows manager's scanner first (if available)
- Option to use manager's scanner or capture own
- Seller confirms choice and modal closes
- Selected image is saved with the sale record
```

### Backend Routes

#### POST /api/auth/register
- Returns `managerScannerPhoto` field in user object

#### POST /api/auth/login
- Returns `managerScannerPhoto` field in authenticated user object

#### GET /api/auth/me
- Returns current user with `managerScannerPhoto` field

#### PATCH /api/auth/me/scanner
- **Role**: Manager only
- **Request Body**: `{ managerScannerPhoto: "base64_string_or_null" }`
- **Response**: Updated `managerScannerPhoto`
- **Purpose**: Upload or remove default scanner image

#### GET /api/auth/manager-scanner
- **Role**: Any authenticated user (seller or manager)
- **Response**: `{ scannerPhoto: "base64_string" }`
- **Purpose**: Fetch manager's uploaded scanner image
- **Error**: 404 if no manager scanner is configured

### Database Model

#### User.js
```javascript
managerScannerPhoto: {
  type: String,
  default: null
  // Stores image as base64 string
}
```

#### SalesRecord.js (implicit via sales route)
```javascript
scannerPhoto: {
  type: String,
  default: null
  // Stores payment proof image (manager's or seller's own)
}
```

---

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    MANAGER FLOW                             │
├─────────────────────────────────────────────────────────────┤
│ Manager Profile → Upload Scanner → Image saved to DB        │
└─────────────────────────────────────────────────────────────┘
                         ↓
                    (via API)
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    SELLER FLOW                              │
├─────────────────────────────────────────────────────────────┤
│ ReviewSave → Select "Online" Payment                        │
│      ↓                                                      │
│ Modal Opens (fetches manager's scanner)                     │
│      ↓                                                      │
│ Seller Chooses:                                             │
│   ├─ Use Manager's Scanner → Image selected                 │
│   └─ Capture Own Proof → Camera opens → Image captured      │
│      ↓                                                      │
│ Click "Confirm" → Modal closes                              │
│      ↓                                                      │
│ Save Record → Payment proof image saved                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

✅ **Manager Dashboard**
- Upload/update payment receipt image in profile
- Remove uploaded image when needed
- Real-time feedback messages

✅ **Seller Online Payment**
- Automatic scanner modal when selecting Online payment
- Shows manager's pre-uploaded receipt
- Option to use manager's receipt or capture own
- Fallback to manual capture if no manager receipt exists

✅ **Image Storage**
- Images stored as base64 strings in MongoDB
- Compact format suitable for small receipts/QR codes
- Can be displayed directly in HTML without additional processing

✅ **Error Handling**
- Graceful fallback if manager scanner is not available
- Proper error messages for upload failures
- User-friendly feedback during loading

---

## Testing Checklist

- [ ] Manager can upload scanner image from profile
- [ ] Manager can update scanner image
- [ ] Manager can remove scanner image
- [ ] Seller can see manager's scanner when selecting Online payment
- [ ] Seller can use manager's scanner for payment proof
- [ ] Seller can capture own photo instead of using manager's
- [ ] Payment proof is saved with sales record
- [ ] Works on mobile camera capture
- [ ] Works on desktop file selection
- [ ] No errors if manager hasn't uploaded scanner

---

## Future Enhancements

1. **Multiple Scanners**: Allow manager to have multiple scanner profiles for different payment methods
2. **Batch Uploads**: Upload multiple receipt images at once
3. **Receipt Gallery**: View all previously used receipts
4. **Image Compression**: Compress images before storing to save DB space
5. **QR Code Detection**: Automatic QR code validation from receipt
6. **Receipt History**: Track which receipt image was used for each sale

---

## Troubleshooting

### Issue: Modal not opening when selecting Online payment
- **Solution**: Check if manager's scanner is uploaded. Modal may not be visible if no image. Try capturing own photo.

### Issue: Manager's scanner not appearing in modal
- **Solution**: 
  - Verify manager is logged in with manager role
  - Check if `GET /api/auth/manager-scanner` returns 200 status
  - Verify image was saved in database

### Issue: Image not saving with sales record
- **Solution**: 
  - Ensure `scannerPhoto` field exists in SalesRecord model
  - Check if image is being selected before clicking "Save Record"
  - Verify payment method is set to "Online"

### Issue: Camera not working on mobile
- **Solution**: 
  - Ensure app has camera permissions in browser/app settings
  - Try using HTTPS (required for camera API on some browsers)
  - Check if browser supports HTMLMediaElement API
