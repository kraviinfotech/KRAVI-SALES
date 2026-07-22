# Flutter Error Handling Guidance

## 1. Authentication Errors
Handle cases where:
- token is missing
- token is expired
- user is unauthorized

Recommended action:
- clear stored token
- navigate to login
- show a friendly message

## 2. Network Errors
Show a retry-friendly message and preserve local draft state when possible.

## 3. Validation Errors
Use field-level validation for:
- empty shop name
- empty product list
- missing payment amount
- invalid phone or email format

## 4. Subscription Errors
If the backend returns subscription-related errors, show a blocking screen or renewal prompt and prevent full app usage until resolved.

## 5. Upload Errors
If image upload fails:
- show a non-blocking error
- keep the unsaved draft locally
- allow the user to retry later

## 6. Synchronous Error Boundaries
Wrap major screens with error boundaries or `FutureBuilder`/`StreamBuilder` error handling to avoid blank states.
