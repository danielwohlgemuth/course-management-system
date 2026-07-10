# 033 Add a list view for Course Plan

**Status:** open

## What

`CoursePlan__c` has no list view defined yet, so there's no easy way to browse all plans. Add an "All Course Plans" list view, following the pattern already used for `Course__c` (`All_Courses.listView-meta.xml`).

## Acceptance criteria

- [ ] New list view on `CoursePlan__c` showing at minimum: Name, Course Name, Owner, Semester, Classroom, Status.
- [ ] Shared to all internal users (matching `Course__c`'s `All_Courses` list view sharing).
- [ ] List view is reachable from the `CoursePlan__c` tab in the Course Manager app.

## Notes

Follow-up cleanup item from task 024. Pairs well with task 032 (Owner on record page) since both surface who owns a plan.

## Related migrations

None — list view metadata only, no schema change.
