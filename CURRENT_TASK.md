# Current Task: Image Storage Migration & Schema Consolidation

## Objective
Address technical debt by migrating from Base64 MongoDB storage to Cloudinary/S3 and ensuring the `SalesRecord` schema matches the route implementation.

## Files Involved
- `backend/routes/sales.js`
- `backend/models/SalesRecord.js`
- `frontend/src/pages/ReviewSave.jsx`
- `backend/routes/auth.js`

## Dependencies
Cloudinary Node SDK, Multer (for file handling).

## Remaining Steps
1. [ ] **Model Sync**: Update `backend/models/SalesRecord.js` to include `managerId`, `shopAddress`, `mobile`, and `landmark` fields which are currently used in routes but missing from schema.
2. [ ] **Cloudinary Setup**: Configure backend environment variables for Cloudinary.
3. [ ] **Refactor Image Upload**: Modify `POST /api/sales/record` and `PATCH /api/auth/me/scanner` to upload to Cloudinary instead of storing Base64 strings.
4. [ ] **Frontend Update**: Update `ReviewSave.jsx` to handle the multipart form-data for actual file uploads rather than Base64 strings.

## Testing Checklist
- [x] Login as Seller A: Verify Seller B's records are not visible.
- [x] Login as Manager X: Verify they cannot see Sellers or Records belonging to Manager Y.
- [ ] Verify images load from external URL instead of DB string.