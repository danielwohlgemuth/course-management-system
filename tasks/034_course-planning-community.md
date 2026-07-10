# 034 Course planning from the Experience Site

**Status:** open

## What

Instructors are external users (Customer Community Plus) and have no access to internal Salesforce record pages, so the existing course planning UI ([024](024_course-planning.md)) — the `CoursePlan_Record_Page` Lightning record page and the `coursePlanSchedule` LWC, both `lightning__RecordPage`-only — is unreachable to them. Build an equivalent flow inside the `Course Portal` Experience Site so instructors can create a course plan, add/edit/delete availability windows, and lock/unlock the plan entirely from the community.

## Acceptance criteria

- [ ] A "My Course Plans" (or similar) list page in the Experience Site showing the instructor's own `CoursePlan__c` records
- [ ] A create/edit form for a `CoursePlan__c` (name, classroom, classes per week, duration per class, semester) usable by community users
- [ ] A way to add, edit, and delete `Availability__c` windows (day of week + start/end time) on a draft plan, from the community
- [ ] A "Lock plan" action reachable from the community that triggers the existing scheduling algorithm and surfaces success/error (unscheduled) states
- [ ] An "Unlock plan" action reachable from the community, with the same confirmation-before-cascade-delete behavior as the internal UI
- [ ] The generated schedule (day, start time, end time per session) is visible to the instructor once a plan is locked and successfully scheduled
- [ ] Navigation item added to the Experience Site's default navigation menu pointing at the new page(s)

## Notes

- `CoursePlan__c`/`Availability__c` object and field permissions are already granted to `CourseInstructor` (verified in `permissionsets/CourseInstructor.permissionset-meta.xml`) — this task is UI-only, no FLS changes expected.
- Reuse the Apex scheduling logic behind `coursePlanSchedule` rather than duplicating it; expose it via `@AuraEnabled` methods callable from new community LWCs if not already structured that way.
- Follow the LWR Experience Cloud constraints noted in [025](025_course-pdf-report.md): standard Lightning quick actions and the Aura highlights panel aren't available there, so this needs plain LWCs targeting `lightningCommunity__Default`/`lightningCommunity__Page`, similar to `courseDownloadPdfReport`.
- After any Experience Builder page changes, the site must be published (`sf community publish --name "Course Portal"`) before they're visible to real users.

## Related migrations

- None anticipated (UI-only; existing objects/fields/permissions already support instructor CRUD).
