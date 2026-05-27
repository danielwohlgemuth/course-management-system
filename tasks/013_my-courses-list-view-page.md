# 013 Add My Courses list view page to Experience Site

**Status:** open

## What

Add a "My Courses" page to the Experience Site that uses a standard `Course__c` list view component. Because `Course__c` uses Private sharing, the list view automatically surfaces only the courses shared with the current user — the courses they are enrolled in for students, and the courses they own for instructors.

## Acceptance criteria

- [ ] "My Courses" page created in Experience Builder
- [ ] Standard list view component configured to show `Course__c` records
- [ ] A suitable list view (e.g. "My Courses") exists on `Course__c` and is selected on the page
- [ ] Page is added to the site navigation
- [ ] Students see only their enrolled courses
- [ ] Instructors see only their own courses
- [ ] Page is accessible to users with `CourseStudent` and `CourseInstructor` permission sets

## Notes

No custom Apex or LWC needed — relies entirely on the Private OWD and sharing rules established in tasks 001, 007, and 008. Depends on task 009 (site).

## Related migrations

- (no migration needed)
