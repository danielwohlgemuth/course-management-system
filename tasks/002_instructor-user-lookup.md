# 002 Add Instructor User lookup field to Course

**Status:** open

## What

Add a new `Instructor_User__c` Lookup(User) field to `Course__c` alongside the existing `Instructor__c` text field. The two fields coexist so a migration script can populate the lookup by matching the text value to User records before the old field is removed (task 014). The new field is not required at this stage.

## Acceptance criteria

- [ ] `Instructor_User__c` Lookup(User) field created on `Course__c` with label "Instructor"
- [ ] Field is not required
- [ ] Migration script matches `Instructor__c` text values to User records by name or email and populates `Instructor_User__c`
- [ ] Unmatched values are logged for manual review
- [ ] Original `Instructor__c` text field is left untouched
- [ ] Change deployed and all existing tests pass

## Notes

Both fields intentionally coexist after this task. Task 014 handles removing the old text field and making the lookup required once the migration is verified.

## Related migrations

- `migrations/YYYY-MM-DD_instructor-user-lookup.md` (add once written)
