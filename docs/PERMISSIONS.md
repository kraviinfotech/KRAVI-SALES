# Permissions Required by the Flutter App

## 1. Camera
Required for:
- capturing shop proof images
- capturing payment proof images
- uploading scanner photos

## 2. Location
Required for:
- attendance check-in/check-out
- sales record GPS capture
- seller location lookup context

## 3. Storage
Required for:
- saving temporary photos before upload
- caching downloaded images
- storing local draft data if offline support is added

## 4. Internet
Required for:
- authentication
- all backend API calls
- image upload
- subscription checkout

## 5. Notifications
Required for:
- receiving payment reminders and app notifications if the Flutter app implements push notification support

## Why These Permissions Exist
The backend workflows assume that the client is able to capture geolocation and images at the moment of recording sales and payments. The Flutter app should explain these permissions clearly and request them at the right time.
