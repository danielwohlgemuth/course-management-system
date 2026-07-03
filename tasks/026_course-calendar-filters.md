# 026 Add filters to Course Calendar

**Status:** open

## What

Add filter controls to the `courseCalendar` LWC so users can narrow the displayed time slots by instructor, semester, course, and classroom. Filters should be combinable (AND logic) and apply client-side against the already-loaded time slot data, re-running `_buildCalendar` with the filtered set.

## Acceptance criteria

- [ ] Filter UI (e.g. a row of `lightning-combobox` controls) added above the calendar grid in `courseCalendar.html`
- [ ] Instructor filter option list is derived from distinct `Course__r.Instructor_User__r.Name` values in the loaded time slots
- [ ] Semester filter option list is derived from distinct `Course__r.Semester__c` values in the loaded time slots
- [ ] Course filter option list is derived from distinct `Course__r.Course_Name__c` values in the loaded time slots
- [ ] Classroom filter option list is derived from distinct `Course__r.Classroom__c` values in the loaded time slots
- [ ] Selecting one or more filters re-renders `calendarDays` to only include matching slots; clearing a filter (e.g. "All") removes that constraint
- [ ] `CourseCalendarController.getTimeSlots()` query is updated to select `Course__r.Semester__c` and `Course__r.Classroom__c` in addition to the existing fields
- [ ] Apex test class updated to cover the new queried fields
- [ ] Existing overlap-grouping and popover behavior continues to work correctly on the filtered subset

## Notes

- Depends on [023](023_classroom-picklist-field.md) (`Classroom__c` picklist field on `Course__c`) — that task is still open and must be deployed first, since `getTimeSlots()` needs to query the field.
- `Semester__c` on `Course__c` already exists (see [021](021_semester-identifier.md)), so no schema change is needed for that filter.
- No schema change is introduced by this task itself, so no new migration file is expected — confirm this holds once `Course__r.Classroom__c` is available.

## Related migrations

None expected (schema already covered by tasks 021 and 023).
