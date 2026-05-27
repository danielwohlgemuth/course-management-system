# 007 Apex trigger: create/delete public group with Course

**Status:** open

## What

Create an Apex trigger on `Course__c` that manages a dedicated public group for each course. When a course is inserted, a new public group is created and a `CourseShare` record is added so all group members get Read access to the course. When a course is deleted, the corresponding public group is deleted. This is the foundation of the experience site sharing model.

## Acceptance criteria

- [ ] On Course insert: a `Group` record (type `Regular`) is created named after the course
- [ ] On Course insert: a `CourseShare` record is created linking the course to the new group with `AccessLevel = Read`
- [ ] The group Id is stored on the Course record (requires a `Public_Group_Id__c` field on `Course__c`)
- [ ] On Course delete (before delete): the associated `Group` record is deleted
- [ ] Trigger is bulkified (handles lists of courses)
- [ ] Apex test class covers insert and delete scenarios with positive and negative assertions
- [ ] All tests pass

## Notes

Storing `Public_Group_Id__c` on `Course__c` avoids a SOQL lookup on every delete. The trigger handler should be extracted into a separate Apex class for testability. Depends on task 001 (Private sharing model must be in place for sharing records to have effect).

## Related migrations

- `migrations/YYYY-MM-DD_course-public-group-trigger.md` (add once written)
