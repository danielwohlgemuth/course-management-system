# 016 Enrollment UniqueKey flow and validation rules

**Status:** done  

## What

Add an after-insert Flow on the Enrollment object that populates the `UniqueKey__c` field. Also add two validation rules to prevent `Student__c` and `Course__c` from being changed after the Enrollment record is created.

## Acceptance criteria

- [x] After-insert Flow sets `UniqueKey__c` on new Enrollment records (e.g. concatenation of Course Id and Student Id)
- [x] Validation rule blocks changes to `Student__c` on existing Enrollment records
- [x] Validation rule blocks changes to `Course__c` on existing Enrollment records
- [x] Existing Enrollment records are unaffected by the Flow (only triggers on insert)
- [x] All Apex tests continue to pass

## Related migrations

- `migrations/2026-06-01_enrollment-uniquekey-flow-and-validation.md`

## Notes

- The Flow should run after insert and use a Record-Triggered Flow (fast field update path is not available post-insert; use a separate update element or an after-save flow with `$Record` and `$Record__Prior`).
- Validation rule formula: `AND(NOT(ISNEW()), ISCHANGED(Student__c))` for Student, same pattern for Course.
- No schema change is needed if `UniqueKey__c` already exists; verify before writing a migration.
