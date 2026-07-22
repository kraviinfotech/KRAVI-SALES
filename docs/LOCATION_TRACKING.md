# Location Tracking Guide

## 1. GPS APIs
The backend stores GPS coordinates in:
- Sales records: latitude and longitude
- Attendance check-in/check-out: checkInLocation and checkOutLocation
- Seller location lookup endpoint: /api/sellers/:id/location

## 2. Location Permissions
The Flutter app must request:
- location permission (always or while in use)
- foreground permission for live tracking
- optional background permission if future background geofencing is desired

## 3. Accuracy
The backend stores `accuracy` as an optional float value from the client. For better reliability:
- use the highest accuracy available
- allow the user to retry when accuracy is poor
- show a warning if accuracy is too low

## 4. Frequency
- For check-in/out, capture once when the user presses the button.
- For sales records, capture once at submission time.
- Avoid continuous tracking unless the product requirements demand it.

## 5. Background Behavior
The backend does not implement background location updates. The Flutter app should not assume background tracking is supported unless explicitly added.

## 6. Distance Calculation
The Flutter app may compute simple distance from the seller’s current location to a known shop location for verification or analytics.

## 7. Shop Verification
The backend does not enforce a strict geo-fence or distance validity rule. The client can optionally add a heuristic such as:
- if distance is within 100 meters, mark as verified
- otherwise allow manual confirmation

## 8. Flutter Recommendations
- Capture location only when user confirms the action.
- Present clear permission explanations.
- Use a loading indicator while waiting for GPS.
- If location fails, allow the user to proceed with a manual address entry and warn them.
