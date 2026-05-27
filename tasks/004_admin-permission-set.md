# 004 Create Course Admin permission set

**Status:** open

## What

Create a `CourseAdmin` permission set that grants full access to all course-related objects. This supersedes the existing `CourseManagerAccess` permission set. Existing assignees of `CourseManagerAccess` must be migrated to `CourseAdmin`, and `CourseManagerAccess` must be retired (removed from the project).

## Acceptance criteria

- [ ] `CourseAdmin` permission set created with:
  - [ ] Full CRUD + View All + Modify All on `Course__c`
  - [ ] Full CRUD + View All + Modify All on `TimeSlot__c`
  - [ ] Full CRUD + View All + Modify All on `Enrollment__c`
  - [ ] Read/Edit on all relevant fields of the above objects
  - [ ] `CourseManager` app visibility
  - [ ] `Course__c` tab visible
- [ ] Migration script reassigns all users from `CourseManagerAccess` to `CourseAdmin`
- [ ] `CourseManagerAccess` permission set removed from the project and undeployed from org
- [ ] All existing tests pass after migration

## Notes

Run the migration script (anonymous Apex) before removing `CourseManagerAccess` from the org to avoid a gap in access. Depends on task 003 for `Enrollment__c` to exist before granting permissions on it.

## Related migrations

- `migrations/YYYY-MM-DD_admin-permission-set.md` (add once written)
