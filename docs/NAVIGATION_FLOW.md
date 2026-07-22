# Navigation Flow for Flutter

## 1. Primary Navigation
```text
Splash
↓
Login
↓
Dashboard
↓
Attendance
↓
Shops / Sales
↓
Sales Records
↓
Notifications
↓
Profile
```

## 2. Screen-to-Screen Navigation
- Splash -> Login if no valid token exists.
- Login -> Dashboard on successful auth.
- Dashboard -> Attendance, Sales Flow, My Records, Notifications, Profile.
- Attendance -> Check In / Check Out actions, then back to Dashboard.
- Sales Flow -> Shop Details -> Product Entry -> Review & Save -> My Records.
- My Records -> Record Detail -> Payment Collection.
- Notifications -> Payment detail or back to Dashboard.
- Profile -> Subscription, Logout, Scanner Upload.

## 3. Manager-Specific Navigation
- Dashboard -> Reports, Sellers, Collections, Attendance.
- Reports -> Record Detail.
- Sellers -> Seller detail -> Location, Payment history.

## 4. Navigation Rules
- Protect routes with auth guards.
- Redirect to login if the token is missing or invalid.
- Keep history simple and predictable for the seller journey.
- Use named routes for maintainability.
