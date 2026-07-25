# 2026-07-25 Community Time Slots/Enrollments (no schema change)

## What changed

Task 035 added `courseTimeSlotsList` and `courseEnrollmentsList` LWCs to the community Course Detail page, backed by new `@AuraEnabled` methods (`CourseCalendarController.getTimeSlotsForCourse`, `CoursePdfReportController.getEnrollments`).

No permission-set or schema changes were needed: `TimeSlot__c.Day_of_Week__c`, `Start_Time__c`, and `End_Time__c` are all required fields (see `migrations/2026-05-11_add-time-slot-object.md`), and Salesforce always exposes required fields to any user with object-level read access: explicit `fieldPermissions` entries for required fields are rejected at deploy time ("You cannot deploy to a required field"), which is why `CourseManagerAccess`, `CourseInstructor`, and `CourseStudent` never listed them individually despite all three having `TimeSlot__c` object read. `Enrollment__c.Student__c`/`UniqueKey__c` were already readable on both `CourseInstructor` and `CourseStudent`. The enrollment roster's "instructor only" visibility is enforced by `CoursePdfReportController`'s existing class access (`CourseInstructor`/`CourseAdmin` only, not `CourseStudent`), not by a new grant.

**New metadata (no permission set edits):**

- `classes/CourseCalendarController.cls`: added `getTimeSlotsForCourse(Id courseId)`
- `classes/CoursePdfReportController.cls`: added `getEnrollments(Id courseId)`
- `lwc/courseTimeSlotsList`, `lwc/courseEnrollmentsList`: new community LWCs
- `labels/CustomLabels.labels-meta.xml`: new labels for both components

## Deploy steps

```bash
sf project deploy start --source-dir force-app/main/default/classes/CourseCalendarController.cls --source-dir force-app/main/default/classes/CourseCalendarController.cls-meta.xml --source-dir force-app/main/default/classes/CourseCalendarControllerTest.cls --source-dir force-app/main/default/classes/CourseCalendarControllerTest.cls-meta.xml
sf project deploy start --source-dir force-app/main/default/classes/CoursePdfReportController.cls --source-dir force-app/main/default/classes/CoursePdfReportController.cls-meta.xml --source-dir force-app/main/default/classes/CoursePdfReportControllerTest.cls --source-dir force-app/main/default/classes/CoursePdfReportControllerTest.cls-meta.xml
sf project deploy start --source-dir force-app/main/default/lwc/courseTimeSlotsList --source-dir force-app/main/default/lwc/courseEnrollmentsList --source-dir force-app/main/default/labels/CustomLabels.labels-meta.xml
sf apex run test --test-level RunLocalTests --synchronous
```

## Data backfill

None: no schema or FLS change.

## Rollback

Remove the `getTimeSlotsForCourse` method from `CourseCalendarController.cls` and the `getEnrollments` method from `CoursePdfReportController.cls` (and their test methods), delete the two LWCs, and remove the associated labels from `CustomLabels.labels-meta.xml`, then redeploy.
