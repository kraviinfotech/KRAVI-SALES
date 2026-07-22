# Flutter Folder Structure Recommendation

Use a feature-first structure so each workflow is isolated and easier to extend.

```text
lib/
  app/
    app.dart
    routes.dart
    theme.dart
  core/
    constants/
    errors/
    extensions/
    utils/
    widgets/
  features/
    auth/
      data/
        datasources/
        models/
        repositories/
      domain/
        entities/
        repositories/
        usecases/
      presentation/
        providers/
        screens/
        widgets/
    attendance/
      data/
      domain/
      presentation/
    sales/
      data/
      domain/
      presentation/
    payments/
      data/
      domain/
      presentation/
    profile/
      data/
      domain/
      presentation/
    reports/
      data/
      domain/
      presentation/
    subscriptions/
      data/
      domain/
      presentation/
    notifications/
      data/
      domain/
      presentation/
  services/
    api/
    auth/
    storage/
    location/
    camera/
    permissions/
    notifications/
  shared/
    models/
    providers/
    repositories/
```

## Recommended Responsibilities
- features/auth: login, forgot password, logout, token storage
- features/attendance: check-in/out and history
- features/sales: record creation, item entry, image upload, review
- features/payments: payment collection and status updates
- features/reports: manager reporting views
- services/api: all HTTP communication
- services/location: GPS capture and verification
- services/camera: image capture and upload
- shared/providers: state management for auth, user profile, subscriptions

## Why This Structure Fits the Backend
The backend is already separated by domain. The Flutter app should mirror that separation to keep the implementation maintainable.
