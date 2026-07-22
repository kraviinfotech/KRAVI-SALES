# Local Storage Recommendation

## 1. Secure Storage
Recommended for:
- JWT token
- refresh token if introduced later
- sensitive flags such as terms acceptance

## 2. Shared Preferences
Recommended for:
- last selected language
- theme preference
- onboarding state
- small user preferences

## 3. SQLite / Hive
Recommended if the app needs:
- offline drafts
- cached records
- offline attendance and sales queues

## 4. Suggested Usage
- Use secure storage for auth and secrets.
- Use shared preferences for non-sensitive flags.
- Use Hive or SQLite for larger local datasets.
