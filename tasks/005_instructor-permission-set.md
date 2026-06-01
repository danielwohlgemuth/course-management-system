# 005 Create Course Instructor permission set

**Status:** done

## What

Create a `CourseInstructor` permission set for users who teach courses. Instructors can create and edit their own Course and TimeSlot records. They are record owners of the courses they create, so OWD Private still gives them full access to their own data without needing View All. They can read Enrollment records to see who has joined their courses.

## Acceptance criteria

- [x] `CourseInstructor` permission set created with:
  - [x] Create, Read, Edit, Delete on `Course__c` (no View All / Modify All)
  - [x] Create, Read, Edit, Delete on `TimeSlot__c` (no View All / Modify All)
  - [x] Read on `Enrollment__c`
  - [x] Read/Edit on all relevant fields of the above objects
  - [x] `Course__c` tab visible
- [x] Permission set deployed to org without errors

## Notes

Instructors do not need explicit sharing rules on Course because they are record owners (Private OWD grants owners full access). Depends on task 003 for `Enrollment__c`.

## Related migrations

- `migrations/2026-06-01_instructor-permission-set.md`
