# Flutter Data Models

## 1. Auth User
Fields:
- id
- name
- email
- phone
- role
- companyId
- subscriptionStatus
- profileImage

## 2. Seller
Fields:
- id
- userId
- shopName
- address
- phone
- status
- managerId

## 3. Sales Record
Fields:
- id
- sellerId
- shopName
- shopAddress
- products
- totalAmount
- paymentMode
- paymentStatus
- latitude
- longitude
- imageUrls
- createdAt

## 4. Attendance Record
Fields:
- id
- sellerId
- checkInTime
- checkOutTime
- status
- location

## 5. Products
Fields:
- id
- name
- price
- category
- imageUrl
- stock

## 6. Payment / Subscription
Fields:
- id
- userId
- amount
- status
- planId
- paymentMethod
- createdAt

## 7. Notification
Fields:
- id
- title
- message
- read
- createdAt

## Implementation Tip
Keep a one-to-one Dart model mapping for the main entities and use small DTO classes for API payloads if the API response varies by endpoint.
