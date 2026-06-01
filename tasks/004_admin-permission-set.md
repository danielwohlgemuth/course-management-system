# 004 Create Course Admin permission set

**Status:** done

## What

Create a `CourseAdmin` permission set that grants full access to all course-related objects. This supersedes the existing `CourseManagerAccess` permission set. Existing assignees of `CourseManagerAccess` must be migrated to `CourseAdmin`, and `CourseManagerAccess` must be retired (removed from the project).

## Acceptance criteria

- [x] `CourseAdmin` permission set created with:
  - [x] Full CRUD + View All + Modify All on `Course__c`
  - [x] Full CRUD + View All + Modify All on `TimeSlot__c`
  - [x] Full CRUD + View All + Modify All on `Enrollment__c`
  - [x] Read/Edit on all relevant fields of the above objects
  - [x] `CourseManager` app visibility
  - [x] `Course__c` tab visible
- [x] Migration script reassigns all users from `CourseManagerAccess` to `CourseAdmin`
- [x] `CourseManagerAccess` permission set removed from the project and undeployed from org
- [x] All existing tests pass after migration

## Notes

Run the migration script (anonymous Apex) before removing `CourseManagerAccess` from the org to avoid a gap in access. Depends on task 003 for `Enrollment__c` to exist before granting permissions on it.

## Related migrations

- `migrations/2026-06-01_admin-permission-set.md`
