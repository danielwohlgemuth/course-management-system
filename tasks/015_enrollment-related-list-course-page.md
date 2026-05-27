# 015 Add Enrollment related list to Course record page

**Status:** done  

## What

Add the Enrollment__c related list to the Course__c Lightning record page so that admins and instructors can see all enrollments directly from the course record in the internal org.

## Acceptance criteria

- [x] The Course record page layout or Lightning App Builder page includes an Enrollment related list
- [x] The related list displays the student name
- [x] The related list is visible to users with the Course Admin and Course Instructor permission sets
- [x] No existing components or sections on the page are broken

## Notes

- The Enrollment__c object must exist before this task can be completed (see task 003).
- Use the Lightning App Builder to add the related list component, or add it via the page layout if a Lightning page is not yet in use.
- If a custom Lightning record page for Course__c does not exist yet, create one and activate it.
