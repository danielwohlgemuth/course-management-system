# 008 Apex trigger: manage group membership on Enrollment

**Status:** open

## What

Create an Apex trigger on `Enrollment__c` that keeps public group membership in sync with enrollments. When a student enrolls in a course, their User is added to the course's public group — which grants them Read access to the course and its time slots via the sharing rule created in task 007. When an enrollment is deleted, the user is removed from the group.

## Acceptance criteria

- [ ] On Enrollment insert: a `GroupMember` record is created adding `Student__c` to the course's `Public_Group_Id__c` group
- [ ] On Enrollment delete (before delete): the corresponding `GroupMember` record is deleted
- [ ] Trigger is bulkified
- [ ] Apex test class covers insert and delete scenarios, asserting group membership is added and removed correctly
- [ ] All tests pass

## Notes

The cascade-delete from Course (master-detail in task 003) will fire this trigger's before-delete context when a course is deleted, cleaning up group members before the group itself is deleted in task 007's trigger. Depends on tasks 003 and 007.

## Related migrations

- (no migration needed — trigger only, no schema change)
