# 017 Optimize Join a Course flow with NOT IN filter

**Status:** open

## What

The `Join_a_Course` flow currently fetches all courses and all of the user's enrollments, then manually filters out enrolled courses using a loop + decision pattern. Replace this with a single `Get_All_Courses` query that uses a filter excluding courses the student is already enrolled in (`Course__c NOT IN (SELECT Course__c FROM Enrollment__c WHERE Student__c = :$User.Id)`), removing the need for `Loop_Filter_Available_Courses`, `Loop_Check_Enrollment`, and the related assignments and decisions.

## Acceptance criteria

- [ ] `Get_My_Enrollments` record lookup is removed
- [ ] `Get_All_Courses` record lookup filters out courses where the user already has an enrollment, using a subfilter/related-record condition on `Enrollment__c`
- [ ] Variables `myEnrollments`, `availableCourses`, `currentCourseId`, and `isEnrolledInCourse` are removed (no longer needed)
- [ ] `Loop_Filter_Available_Courses`, `Loop_Check_Enrollment`, `Assign_Current_Course_Id`, `Assign_Reset_IsEnrolled`, `Assign_Set_IsEnrolled`, `Decision_Add_Course`, and `Decision_Enrollment_Matches` are removed
- [ ] `Get_All_Courses` output goes directly to the `Screen_Select_Course` datatable
- [ ] Flow still correctly shows only unenrolled courses when tested in the Experience Site

## Notes

Flow filter syntax for "not enrolled": add a filter on `Course__c` with an `inCollection` / NOT IN subquery condition referencing `Enrollment__c.Course__c` where `Student__c = $User.Id`. Verify Salesforce Flow supports this via a related-record sub-filter; if not, a lighter alternative is to keep `Get_My_Enrollments` but replace the manual loop with a collection-filter element.
