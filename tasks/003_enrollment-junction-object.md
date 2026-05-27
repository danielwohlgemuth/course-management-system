# 003 Create Enrollment junction object

**Status:** open

## What

Create a new `Enrollment__c` custom object that links `Course__c` to a Salesforce User. This represents a student's membership in a course and is the record that triggers public group membership (tasks 007, 008). Each enrollment is a unique Course + User pair.

## Acceptance criteria

- [ ] `Enrollment__c` object exists with label "Enrollment" / plural "Enrollments"
- [ ] `Course__c` master-detail lookup field on `Enrollment__c` pointing to `Course__c`
- [ ] `Student__c` lookup field on `Enrollment__c` pointing to `User`
- [ ] Duplicate rule or unique field combination prevents a user enrolling in the same course twice
- [ ] Object deployed to org without errors
- [ ] Migration file written

## Notes

Use a master-detail relationship to `Course__c` (not lookup) so that deleting a course cascade-deletes its enrollments, which in turn triggers the group membership cleanup trigger (task 008).

## Related migrations

- `migrations/YYYY-MM-DD_enrollment-object.md` (add once written)
