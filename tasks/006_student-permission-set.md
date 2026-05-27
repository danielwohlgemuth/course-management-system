# 006 Create Course Student permission set

**Status:** open

## What

Create a `CourseStudent` permission set for experience site users who attend courses. Students can read Course and TimeSlot records that have been explicitly shared with them (via the public group mechanism in tasks 007, 008). They can create their own Enrollment records to join a course and read their own enrollments.

## Acceptance criteria

- [ ] `CourseStudent` permission set created with:
  - [ ] Read on `Course__c`
  - [ ] Read on `TimeSlot__c`
  - [ ] Create, Read on `Enrollment__c` (no Edit, Delete, View All, Modify All)
  - [ ] Read on all relevant fields of the above objects
- [ ] Permission set deployed to org without errors

## Notes

Students get Course/TimeSlot read access only for records shared with them via the public group (Private OWD). The screen flow (task 011) runs in system context so it can display all courses for browsing even before the student is enrolled. Depends on task 003 for `Enrollment__c`.

## Related migrations

- `migrations/YYYY-MM-DD_student-permission-set.md` (add once written)
