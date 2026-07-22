# UI/UX Guidelines for Flutter Seller App

## 1. Screen Inventory
The backend suggests the following Flutter screens and flows:
- Splash
- Login
- Forgot Password / Reset Password
- Dashboard
- Attendance
- Sales Flow (shop details, products, review, submit)
- My Records
- Payments / Collections
- Notifications
- Profile
- Settings / Subscription
- Reports

## 2. Screen Requirements

### Splash Screen
- Purpose: initialize app state and verify token availability.
- Displayed data: app logo, loading state.
- Actions: auto-navigation.
- Permissions: none.

### Login Screen
- Purpose: authenticate seller or manager.
- Displayed data: email/mobile, password, role selector, forgot password.
- Buttons: Login, Google Sign-In, Forgot Password.
- Validations: required credentials, minimum password length.
- Navigation: route to dashboard or error state.
- Empty state: no fields entered.
- Loading state: while authentication request is in progress.
- Error state: invalid credentials or locked account.
- Permissions: internet.

### Dashboard Screen
- Purpose: show summary metrics and quick actions.
- Displayed data: today sales, visits, items sold, subscription status.
- Buttons: Start Selling, Attendance, My Records, Notifications.
- Actions: navigate to feature flows.
- Permissions: internet, location for context if needed.

### Attendance Screen
- Purpose: allow seller check-in/out.
- Displayed data: current day status, check-in time, working hours.
- Buttons: Check In, Check Out.
- Actions: capture GPS.
- Validations: cannot check out before check in.
- Empty state: no attendance record for the day.
- Loading state: while request is pending.
- Error state: already checked in/out or location unavailable.
- Permissions: location.

### Sales Flow Screens
- Purpose: capture a shop visit and record products sold.
- Screens: Shop Details, Product Entry, Review & Save.
- Displayed data: shop name, address, latitude/longitude, items, totals, payment method.
- Buttons: Next, Add Item, Remove Item, Save Record.
- Actions: capture GPS, select payment method, add product, upload images, save.
- Validations: required shop name/address, minimum one item, positive price.
- Empty state: no items added.
- Loading state: submitting record.
- Error state: invalid input, upload failure, subscription block.
- Permissions: location, camera/storage, internet.

### My Records Screen
- Purpose: display seller history.
- Displayed data: records list, amounts, payment status, images.
- Buttons: View details, filter, refresh.
- Actions: view details, collect payment.
- Empty state: no records yet.
- Loading state: fetch records.
- Error state: fetch failure.
- Permissions: internet.

### Payment Collection Screen
- Purpose: collect payment for a sales record.
- Displayed data: pending amount, payment mode, receipt proof.
- Buttons: Submit Payment.
- Validations: amount must be positive and not exceed pending amount.
- Permissions: camera/storage, internet.

### Notifications Screen
- Purpose: show manager notifications for payments and events.
- Displayed data: unread count, list of notifications.
- Buttons: Mark all read.
- Permissions: internet.

### Profile Screen
- Purpose: show user profile and manage scanner image if manager.
- Displayed data: name, email, mobile, role, subscription tier, scanner photo.
- Buttons: Edit, Upload Photo, Logout.
- Permissions: camera/storage, internet.

### Subscription Screen
- Purpose: show current plan and allow checkout.
- Displayed data: plan options, price, limits, expiry.
- Buttons: Choose Plan, Pay.
- Validations: payment keys must be configured.
- Permissions: internet.

### Reports Screen
- Purpose: show manager analytics.
- Displayed data: sales trend, seller performance, collection summary.
- Buttons: Filter, Export.
- Permissions: internet.

## 3. UI Principles
- Use Material 3 components.
- Provide clear empty and loading states.
- Keep the seller workflow short and linear.
- Use bottom navigation or a compact drawer for core flows.
- Favor large tappable surfaces and clear spacing.
- Use localized strings for English, Hindi, and Marathi.
- Support offline-safe design with queued actions where feasible.

## 4. Accessibility
- Large text and touch targets.
- Clear labels for fields and actions.
- Screen-reader-friendly form semantics.
- Sufficient contrast and hierarchy.
