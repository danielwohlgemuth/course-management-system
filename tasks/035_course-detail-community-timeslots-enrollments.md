# 035 Show time slots, enrollments, and PDF report on the community Course Detail page

**Status:** open

## What

The `Course Detail` page in the `Course Portal` Experience Site currently only exposes the `courseDownloadPdfReport` button ([025](025_course-pdf-report.md)). Instructors viewing a course from the community can't see its generated time slots or enrolled students without internal Salesforce access. Add related-list-style LWCs for `TimeSlot__c` and `Enrollment__c` to the community Course Detail page, alongside the existing PDF report button.

## Acceptance criteria

- [ ] LWC showing the course's `TimeSlot__c` records (day, start time, end time) on the community Course Detail page
- [ ] LWC showing the course's `Enrollment__c` records (enrolled students) on the community Course Detail page
- [ ] `courseDownloadPdfReport` button remains present and working alongside the new components
- [ ] Both new components respect existing field/object permissions for `CourseInstructor` (and `CourseStudent`, if students should see this page too — clarify visibility during implementation)
- [ ] Components render correctly for a course with zero, one, and many time slots/enrollments

## Notes

- Standard Lightning related lists aren't available on LWR Experience Cloud pages, so this needs plain LWCs querying via `@AuraEnabled` Apex (or `uiRecordApi`/`getRelatedListRecords` if supported for community contexts), following the pattern used for `courseCalendar` and `courseDownloadPdfReport`.
- Reuse existing Apex query logic where possible (e.g. `CoursePdfReportController` already queries `Enrollment__c` for a course).
- After Experience Builder changes, publish the site (`sf community publish --name "Course Portal"`) for the changes to go live.

## Related migrations

- None anticipated (UI-only, reusing existing objects/fields).
