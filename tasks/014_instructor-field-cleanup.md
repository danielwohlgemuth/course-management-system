# 014 Remove legacy Instructor text field and make lookup required

**Status:** done

## What

Once the migration from task 002 has been verified and all `Course__c` records have a populated `Instructor_User__c` value, remove the legacy `Instructor__c` text field and mark `Instructor_User__c` as required. Any UI or Apex references to the old field must be updated to use the new one beforehand.

## Acceptance criteria

- [x] All `Course__c` records have a non-null `Instructor_User__c` value (verified before proceeding)
- [x] `Instructor_User__c` field set to required (`<required>true</required>`)
- [x] `Instructor__c` text field removed from `Course__c` metadata and deleted from the org
- [x] Any Apex classes, LWC, flows, or page layouts referencing `Instructor__c` updated to use `Instructor_User__c`
- [x] All tests pass after the change
- [x] Change deployed without errors

## Notes

Do not proceed with this task until task 002's migration script has been run and unmatched records have been resolved manually. Deleting a field in Salesforce is permanent — confirm via SOQL that no record has a blank `Instructor_User__c` before removing the text field.

## Related migrations

- [migrations/2026-06-10_instructor-field-cleanup.md](../migrations/2026-06-10_instructor-field-cleanup.md)
