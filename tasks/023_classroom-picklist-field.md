# 023 Add Classroom picklist field to Course object

**Status:** done

## What

Add a `Classroom__c` picklist field to the `Course__c` object so that instructors can specify which classroom a course takes place in. The picklist values should represent available classroom locations (e.g. Room 101, Room 202, Online).

## Acceptance criteria

- [x] `Classroom__c` picklist field exists on `Course__c`
- [x] Picklist values are defined and deployed
- [x] Field is visible on the Course record page layout
- [x] Migration file documents the change and rollback steps

## Notes

Picklist values should be defined to match the real locations available. Coordinate with stakeholders if the list of rooms needs to reflect actual facilities.

## Related migrations

- `migrations/2026-07-03_classroom-picklist-field.md`
