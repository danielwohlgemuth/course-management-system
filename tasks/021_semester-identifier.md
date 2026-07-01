# 021 Semester identifier

**Status:** done

## What

Add a `Semester__c` text field to `CourseCalendarConfig__mdt` to store the current semester identifier (format: `2026 S1`). Update the `Default` config record with the current value. Add a `Semester__c` text field to `Course__c` to stamp each course with its semester, and an `Is_Current_Semester__c` formula checkbox on `Course__c` that evaluates to true when the course's semester matches the config value. The checkbox enables native list view filtering without any Apex or Flow involvement.

## Acceptance criteria

- [x] `Semester__c` field added to `CourseCalendarConfig__mdt` (Text, length 10)
- [x] `CourseCalendarConfig.Default` record updated with value `2026 S1`
- [x] `Semester__c` field added to `Course__c` (Text, length 10, not required)
- [x] `Is_Current_Semester__c` formula checkbox added to `Course__c` with formula: `Semester__c = $CustomMetadata.CourseCalendarConfig__mdt.Default.Semester__c`
- [x] New `Current_Semester_Courses` list view added to `Course__c` with label "Current Semester's Courses", columns `Name`, `Course_Name__c`, `Instructor_User__c`, `Semester__c`, filter `Is_Current_Semester__c = true`, and set as the default list view (org has no deployable metadata for a shared default list view — this is a manual per-user pin step documented in the migration)
- [x] `CourseCalendarController.getConfig()` selects `Semester__c` so the calendar LWC can access the current semester label
- [x] Migration file written covering deploy steps, backfill instructions for existing Course records (populate `Semester__c`), and rollback

## Notes

- Custom Metadata was chosen over Custom Settings: it matches the existing `CourseCalendarConfig__mdt` pattern and is version-controlled.
- `Is_Current_Semester__c` is a formula field — it recalculates automatically when the `Default` config record is redeployed with a new semester value. No backfill needed for the checkbox itself.
- The `Join_a_Course` flow and `Enrollment_Set_UniqueKey` flow are not in scope for this task unless a future task decides the semester should be part of the enrollment unique key (currently `CourseId_StudentId`).

## Related migrations

- `migrations/2026-06-30_semester-identifier.md`
