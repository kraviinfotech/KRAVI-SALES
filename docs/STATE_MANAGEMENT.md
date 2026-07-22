# State Management Recommendation

## 1. Provider Architecture
Use Provider with a simple layered structure:
- Providers: manage state for each feature
- Repositories: wrap backend API calls
- Services: handle platform integrations such as camera, location, storage
- Models: domain entities reflecting backend JSON
- ViewModels: optional helper layer for form state and UI logic

## 2. Suggested Providers
- AuthProvider
- SubscriptionProvider
- AttendanceProvider
- SalesProvider
- PaymentProvider
- NotificationProvider
- ReportsProvider

## 3. Repository and Service Flow
```text
UI
↓
Provider
↓
Repository
↓
ApiService / DioClient
↓
Backend API
```

## 4. Dependency Flow
- AuthProvider depends on AuthRepository and SecureStorage.
- SalesProvider depends on SalesRepository, ImageService, and LocationService.
- PaymentProvider depends on PaymentRepository and CameraService.
- SubscriptionProvider depends on SubscriptionRepository.

## 5. Recommended Model Mapping
- Map backend JSON into Dart models with `fromJson` and `toJson`.
- Keep the model layer separate from API DTOs if you want cleaner business logic.

## 6. Provider Responsibilities
- Keep providers focused on one workflow.
- Avoid putting raw HTTP logic inside widgets.
- Expose `isLoading`, `error`, and `data` states clearly.
