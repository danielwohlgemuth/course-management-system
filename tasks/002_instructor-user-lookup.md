# 002 Replace Instructor text field with User lookup

**Status:** open

## What

Replace the existing `Instructor__c` Text field on `Course__c` with a User lookup field of the same API name. This allows instructors to be proper record owners and enables sharing and permission logic to reference a real Salesforce User. A migration script will attempt to match existing text values to User records by name or email before the old field is removed.

## Acceptance criteria

- [ ] Old `Instructor__c` Text field is removed from `Course__c`
- [ ] New `Instructor__c` Lookup(User) field exists on `Course__c`
- [ ] Migration script matches existing text values to User records and populates the new field
- [ ] Unmatched values are logged for manual review
- [ ] Field is not required (can be blank)
- [ ] Change deployed and all existing tests pass

## Notes

The field is not required initially. The migration script should run as an anonymous Apex execution after deploying the new field and before removing the old one, so both exist simultaneously during the transition.

## Related migrations

- `migrations/YYYY-MM-DD_instructor-user-lookup.md` (add once written)
