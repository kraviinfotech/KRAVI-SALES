# Coding Standards for Flutter Seller App

## 1. Architecture
Use Clean Architecture with clear separation between:
- presentation
- domain
- data

## 2. Repository Pattern
Create repositories for all backend communication. Example responsibilities:
- AuthRepository
- AttendanceRepository
- SalesRepository
- PaymentsRepository
- ReportsRepository

## 3. State Management
Use Provider as the primary state management approach, with:
- AuthProvider
- AttendanceProvider
- SalesProvider
- PaymentProvider
- SubscriptionProvider
- NotificationProvider

## 4. SOLID Principles
- Single responsibility per class
- Dependency inversion via abstractions
- Small focused providers and repositories
- Avoid business logic inside widgets

## 5. Null Safety
- Prefer non-nullable types
- Use `?` only when data can truly be absent
- Handle null state explicitly

## 6. Reusable Widgets
Create reusable widgets for:
- AppButton
- AppTextField
- LoadingStateWidget
- EmptyStateWidget
- ErrorStateWidget
- ImagePickerCard
- MapPreviewCard

## 7. Material 3
- Use Material 3 theming
- Use color schemes and typography tokens
- Respect surface elevation and spacing standards

## 8. Responsive UI
- Support phone screens and tablets
- Avoid hard-coded pixel values where possible
- Use `LayoutBuilder`, `MediaQuery`, and flexible widgets

## 9. Error Handling
- Wrap API calls in try/catch
- Convert backend errors into user-friendly messages
- Show inline errors and retry options

## 10. Loading States
- Show progress indicators on all network actions
- Disable buttons while pending
- Avoid duplicate submissions

## 11. Dependency Injection
- Inject repositories and services through providers or constructors
- Keep the app testable and decoupled

## 12. Performance Recommendations
- Cache user profile and subscription state
- Use lazy loading for longer lists
- Avoid unnecessary rebuilds
- Use image placeholders and compression for uploads
