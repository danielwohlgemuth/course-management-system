# 018 Fix instructor name not showing in Join a Course datatable

**Status:** open

## What

The `Screen_Select_Course` datatable in the `Join_a_Course` flow includes an `Instructor_User__c` column configured as `customReferenceLabel`, but the instructor name renders blank. The root cause is that `Get_All_Courses` does not query the `Instructor_User__c` field, so the collection records have no value for the lookup and the datatable has nothing to display.

## Acceptance criteria

- [ ] `Get_All_Courses` record lookup includes `Instructor_User__c` in its `queriedFields`
- [ ] The instructor column in the datatable displays the instructor's full name in the Experience Site
- [ ] No regressions to course number or course name columns

## Notes

Adding `Instructor_User__c` to `queriedFields` should be sufficient for `customReferenceLabel` to resolve the name via the reference config already defined in the column (`nameFieldApiName: "Name"`). Verify by running the flow as a student in the Experience Site.
