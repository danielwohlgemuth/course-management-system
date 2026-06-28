# 023 Add Classroom picklist field to Course object

**Status:** open

## What

Add a `Classroom__c` picklist field to the `Course__c` object so that instructors can specify which classroom a course takes place in. The picklist values should represent available classroom locations (e.g. Room 101, Room 202, Online).

## Acceptance criteria

- [ ] `Classroom__c` picklist field exists on `Course__c`
- [ ] Picklist values are defined and deployed
- [ ] Field is visible on the Course record page layout
- [ ] Migration file documents the change and rollback steps

## Notes

Picklist values should be defined to match the real locations available. Coordinate with stakeholders if the list of rooms needs to reflect actual facilities.

## Related migrations

- `migrations/YYYY-MM-DD_classroom-picklist-field.md` (add once a migration is written)
