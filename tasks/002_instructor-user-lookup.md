# 002 Add Instructor User lookup field to Course

**Status:** done

## What

Add a new `Instructor_User__c` Lookup(User) field to `Course__c` alongside the existing `Instructor__c` text field. The two fields coexist so a migration script can populate the lookup by matching the text value to User records before the old field is removed (task 014). The new field is not required at this stage.

## Acceptance criteria

- [x] `Instructor_User__c` Lookup(User) field created on `Course__c` with label "Instructor"
- [x] Field is not required
- [x] Migration script matches `Instructor__c` text values to User records by name or email and populates `Instructor_User__c`
- [x] Unmatched values are logged for manual review
- [x] Original `Instructor__c` text field is left untouched
- [x] Change deployed and all existing tests pass

## Notes

Both fields intentionally coexist after this task. Task 014 handles removing the old text field and making the lookup required once the migration is verified.

## Related migrations

- `migrations/2026-06-10_instructor-user-lookup.md`
