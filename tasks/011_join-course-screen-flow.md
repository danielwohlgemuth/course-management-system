# 011 Build screen flow for joining a course

**Status:** done

## What

Create a Screen Flow that runs in system context so it can query and display all available courses regardless of the current user's sharing access. The student selects a course from the list and the flow creates an `Enrollment__c` record linking the student to the chosen course. Creating the enrollment triggers the public group membership logic (task 008), which then grants the student read access to the course.

## Acceptance criteria

- [x] Screen flow created and set to run in system context
- [x] First screen displays all `Course__c` records (course number, name, instructor)
- [x] Student can select one course to join
- [x] Flow creates an `Enrollment__c` record with `Course__c` and `Student__c` set to the selected course and the running user
- [x] Flow shows a confirmation message on success
- [x] Flow handles the case where the student is already enrolled (duplicate) gracefully with an error message
- [x] Flow is activated

## Notes

Does not support leaving/unenrolling — that is out of scope. Depends on tasks 003 (Enrollment object), 007 (public group on course), and 008 (group membership on enrollment) for the sharing side-effect to work correctly.

## Related migrations

- (no migration needed)
