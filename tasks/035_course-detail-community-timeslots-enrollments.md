# 035 Show time slots, enrollments, and PDF report on the community Course Detail page

**Status:** done

## What

The `Course Detail` page in the `Course Portal` Experience Site currently only exposes the `courseDownloadPdfReport` button ([025](025_course-pdf-report.md)). Instructors viewing a course from the community can't see its generated time slots or enrolled students without internal Salesforce access. Add related-list-style LWCs for `TimeSlot__c` and `Enrollment__c` to the community Course Detail page, alongside the existing PDF report button.

## Acceptance criteria

- [x] LWC showing the course's `TimeSlot__c` records (day, start time, end time) on the community Course Detail page
- [x] LWC showing the course's `Enrollment__c` records (enrolled students) on the community Course Detail page
- [x] `courseDownloadPdfReport` button remains present and working alongside the new components
- [x] Both new components respect existing field/object permissions for `CourseInstructor` (and `CourseStudent`, if students should see this page too: clarify visibility during implementation)
- [x] Components render correctly for a course with zero, one, and many time slots/enrollments

## Notes

- Standard Lightning related lists aren't available on LWR Experience Cloud pages, so this needs plain LWCs querying via `@AuraEnabled` Apex (or `uiRecordApi`/`getRelatedListRecords` if supported for community contexts), following the pattern used for `courseCalendar` and `courseDownloadPdfReport`.
- Reuse existing Apex query logic where possible (e.g. `CoursePdfReportController` already queries `Enrollment__c` for a course).
- After Experience Builder changes, publish the site (`sf community publish --name "Course Portal"`) for the changes to go live.

### Implementation notes

- Visibility, per user decision: **Time Slots** are visible to both `CourseInstructor` and `CourseStudent` (schedule info is non-sensitive and both already have `TimeSlot__c` object-level read). **Enrollments** (the student roster) are visible to `CourseInstructor` only, mirroring the `courseDownloadPdfReport` button's existing Instructor/Admin-only visibility (task 025), since it exposes other students' names.
- Two new community-exposed LWCs (`lightningCommunity__Default`/`lightningCommunity__Page`), each taking `recordId` (the course) via `default="{!recordId}"`, following the `courseDownloadPdfReport` pattern:
  - `courseTimeSlotsList`: table of Day / Start Time / End Time, backed by a new `CourseCalendarController.getTimeSlotsForCourse(courseId)` method. Reused `CourseCalendarController` rather than a new class specifically because it's already granted class access by both `CourseInstructor` and `CourseStudent` permission sets: no new class-access grants needed to get the "both roles" visibility.
  - `courseEnrollmentsList`: table of Student, backed by a new `CoursePdfReportController.getEnrollments(courseId)` method, reusing the same query already used by the Visualforce PDF report (per the task's own note). `CoursePdfReportController` class access is already restricted to `CourseInstructor`/`CourseAdmin` (not `CourseStudent`), which is what actually enforces the "instructor only" visibility: the component itself doesn't need its own permission check.
- Investigated a suspected FLS gap: neither `CourseInstructor` nor `CourseStudent` listed explicit field permissions for `TimeSlot__c.Day_of_Week__c`/`Start_Time__c`/`End_Time__c`. This turned out to be a non-issue, not a gap: all three are required fields on `TimeSlot__c` ([2026-05-11_add-time-slot-object.md](../migrations/2026-05-11_add-time-slot-object.md)), and Salesforce always exposes required fields to any user with object-level read; deploying explicit `fieldPermissions` entries for them is rejected outright ("You cannot deploy to a required field"), confirmed by a failed deploy attempt. No permission set changes were needed for the `getTimeSlotsForCourse` `WITH USER_MODE` query to work for both roles.
- Both components handle zero/one/many records (empty-state message vs. a table), and show a friendly error message + call `logError` if the wire adapter errors, consistent with `courseCalendar`/`courseAvailabilityManager`.
- **Manual Experience Builder step required** (same limitation noted in tasks 025 and 034: LWR page component placement isn't trackable via source/CLI): an admin must drag `Course Time Slots` (`c-courseTimeSlotsList`) and `Course Enrollments` (`c-courseEnrollmentsList`) onto the Course Detail page in Experience Builder for **Course Portal**, alongside the existing PDF report button, then publish: `sf community publish --name "Course Portal"`.
- Verified: all Apex tests pass (including new `getTimeSlotsForCourse*Test` and `getEnrollments*Test` methods covering zero/one/many cases) and all 8 Jest suites (37 tests) pass, including the 8 new tests for these two components.

## Related migrations

- [2026-07-25_community-timeslots-enrollments.md](../migrations/2026-07-25_community-timeslots-enrollments.md): no schema/permission-set changes; documents why none were needed and the deploy steps for the new Apex/LWC.
