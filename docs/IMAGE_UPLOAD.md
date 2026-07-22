# Image Upload Guide

## 1. Upload APIs
The main image upload endpoints are:
- POST /api/sales/record
- PATCH /api/auth/me/scanner
- POST /api/shoppayments/receive

## 2. Multipart Format
The sales record endpoint uses multipart/form-data with fields:
- shopImage
- scannerPhoto

The auth scanner endpoint uses multipart/form-data with field:
- managerScannerPhoto

## 3. Image Fields
- shopImage: shop proof image
- scannerPhoto: sales proof / scanner image
- managerScannerPhoto: manager default scanner image
- paymentPhoto: optional payment proof field in the shop payment route (currently passed as a body string in the route, but the Flutter app should use multipart if possible)

## 4. Azure Blob Storage
Images are uploaded to Azure Blob Storage via [backend/utils/azureBlob.js](../backend/utils/azureBlob.js).
- Files are stored in a container from AZURE_CONTAINER_NAME.
- The backend generates a UUID-based filename with the original extension.
- The stored value is a blob name, not a full URL.

## 5. Image URLs
The backend resolves blob names into SAS URLs via `resolveBlobUrl()`.
The Flutter app should expect URLs in responses when image data is returned.

## 6. File Limits
- Multer max file size: 5MB per file
- Max files per request: 2
- Image mimetype must start with image/

## 7. Compression Recommendations
- Compress before upload if the image is large.
- Prefer JPEG for photos and PNG for screenshots if needed.
- Resize to practical dimensions for mobile screens.

## 8. Flutter Implementation Recommendations
- Use `dio` or `http` multipart form requests.
- Send image files as `MultipartFile`.
- Keep compression and progress UI in place.
- Handle upload failures gracefully.
- Cache uploaded image URLs locally if needed for offline viewing.
