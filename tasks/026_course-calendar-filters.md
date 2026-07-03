# 026 Add filters to Course Calendar

**Status:** done

## What

Add filter controls to the `courseCalendar` LWC so users can narrow the displayed time slots by instructor, semester, course, and classroom. Filters should be combinable (AND logic) and apply client-side against the already-loaded time slot data, re-running `_buildCalendar` with the filtered set.

## Acceptance criteria

- [x] Filter UI (a row of `lightning-combobox` controls) added above the calendar grid in `courseCalendar.html`
- [x] Instructor filter option list is derived from distinct `Course__r.Instructor_User__r.Name` values in the loaded time slots
- [x] Semester filter option list is derived from the `Course__c.Semester__c` **picklist values** (via `getPicklistValues`), and changing it **re-queries the server** (`getTimeSlots(semester)` applies a `WHERE`), rather than being derived client-side — see Notes
- [x] Course filter option list is derived from distinct `Course__r.Course_Name__c` values in the loaded time slots
- [x] Classroom filter option list is derived from distinct `Course__r.Classroom__c` values in the loaded time slots
- [x] Selecting one or more filters re-renders `calendarDays` to only include matching slots; clearing a filter ("All") removes that constraint. Instructor/course/classroom are applied client-side; changing the semester re-fetches and resets the other three filters
- [x] `CourseCalendarController.getTimeSlots()` query is updated to select `Course__r.Semester__c` and `Course__r.Classroom__c` in addition to the existing fields, and takes a `semester` param for the server-side filter
- [x] Apex test class updated to cover the new queried fields and the semester-filter path
- [x] Existing overlap-grouping and popover behavior continues to work correctly on the filtered subset (filtering happens upstream of `_buildCalendar`, so the union-find/popover logic is unchanged)

## Notes

- Depends on [023](023_classroom-picklist-field.md) (`Classroom__c` picklist field on `Course__c`) — that task is still open and must be deployed first, since `getTimeSlots()` needs to query the field.
- `Semester__c` on `Course__c` already exists (see [021](021_semester-identifier.md)), so no schema change is needed for that filter.
- No schema change is introduced by this task itself, so no new migration file is expected — confirmed, both `Semester__c` and `Classroom__c` already exist.
- **Semester filter refinement:** unlike the other three (client-side, derived from loaded slots), the Semester filter's options come from the `Course__c.Semester__c` picklist and selecting a value re-queries the org server-side. On load it preselects the configured default from `CourseCalendarConfig__mdt.Semester__c` (returned by `getConfig()`); changing it resets instructor/course/classroom to "All".

## Related migrations

None expected (schema already covered by tasks 021 and 023).
