# Firestore Security Specification (`security_spec.md`)

## 1. Data Invariants & Access Model
- **Admins (`isAdmin()`):** Authenticated users with `request.auth != null && request.auth.token.email_verified == true` and email in `['rentpe.support.in@gmail.com', 'admin@shinegroupjobs.com', 'admin@shinegroupjob.com']`.
- **Job Vacancies (`/jobs/{jobId}`):** Publicly readable (`get`, `list`) by all portal visitors. Only verified Admins can `create`, `update`, or `delete` job postings. Every string, number, boolean, and array field is strictly type- and size-checked. `id` is immutable on update and validated via `isValidId(jobId)`.
- **Website CMS Settings (`/site_settings/{settingId}`):** Publicly readable (`get`, `list`). Only verified Admins can write/update settings, enforced by `isValidSiteSettings()`.
- **Users (`/users/{userId}`):** Strict PII isolation (`get` restricted to `isOwner(userId) || isAdmin()`, `list` restricted to `isAdmin() || resource.data.id == request.auth.uid`). Self-assigned admin roles are blocked: non-admin users may only create documents with `role == 'job_seeker'` and cannot mutate `id` or `role`.
- **Applications (`/applications/{applicationId}`):** PII isolation: `get` and `list` restricted to `isAdmin()` or the authenticated applicant (`resource.data.email == request.auth.token.email` or `resource.data.applicantUid == request.auth.uid`). Creation enforces strict schema (`isValidApplication`) and locks initial `status == 'Submitted'`. Only Admins can update status or delete applications.
- **Certificates (`/certificates/{certificateId}`):** Public verification lookup (`get`, `list`). Candidate requests are strictly locked to `status == 'Pending Approval'`; only verified Admins can issue `'Approved'` certificates directly, approve/reject pending requests, or delete records.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Privilege Escalation (User Create):** Signing in as a regular user (`uid-123`) and creating `/users/uid-123` with `{ role: "admin" }` -> MUST fail (`PERMISSION_DENIED`).
2. **Privilege Escalation (User Update):** Regular user updating their `/users/uid-123` doc to set `{ role: "admin" }` -> MUST fail (`PERMISSION_DENIED`).
3. **Unauthenticated Job Creation:** Anonymous or non-admin signed-in job seeker attempting to create `/jobs/job-999` -> MUST fail (`PERMISSION_DENIED`).
4. **Job Shadow Field Injection ("Ghost Field"):** Admin or user attempting to write `/jobs/job-999` with an undeclared field `{ isVerified: true, ghostField: "x" }` -> MUST fail (`PERMISSION_DENIED`).
5. **Email Spoofing Attack:** User token containing `email: "rentpe.support.in@gmail.com"` with `email_verified: false` attempting admin write -> MUST fail (`PERMISSION_DENIED`).
6. **PII Blanket Scrape (`/users`):** Signed-in non-admin job seeker calling `getDocs(collection(db, 'users'))` or `getDoc(doc(db, 'users', 'other-uid'))` -> MUST fail (`PERMISSION_DENIED`).
7. **PII Blanket Scrape (`/applications`):** Signed-in non-admin querying `/applications` without ownership constraint or reading another candidate's application -> MUST fail (`PERMISSION_DENIED`).
8. **Certificate Approval Bypass:** Non-admin submitting `/certificates/cert-999` directly with `{ status: "Approved" }` -> MUST fail (`PERMISSION_DENIED`).
9. **Application Status Tampering:** Candidate attempting to update `/applications/app-123` to `{ status: "Shortlisted" }` -> MUST fail (`PERMISSION_DENIED`).
10. **Path ID Poisoning:** Attempting to create a document with an invalid 200-char or special-char ID like `../admin` or `"a".repeat(200)` -> MUST fail (`PERMISSION_DENIED`).
11. **Value Poisoning (Oversized Payload):** Attempting to write `/jobs/job-999` with a 20,000-char `description` or >100 element `skills` array -> MUST fail (`PERMISSION_DENIED`).
12. **Site Settings Tampering:** Non-admin attempting to overwrite `/site_settings/main` -> MUST fail (`PERMISSION_DENIED`).
