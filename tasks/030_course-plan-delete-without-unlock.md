# 030 Allow deleting a locked CoursePlan without unlocking first

**Status:** open

## What

`CoursePlanHandler.onBeforeDelete` currently blocks deletion of any `CoursePlan__c` in `Locked` status, forcing the user to run Unlock (which deletes the generated course, its schedule, and its enrollments) before they can delete the plan. Change this so a locked plan can be deleted directly, and the generated course is left intact — deleting the plan is just discarding the planning record, not tearing down the live course.

## Acceptance criteria

- [ ] Deleting a `CoursePlan__c` with `Status__c = 'Locked'` succeeds without a prior Unlock step.
- [ ] The plan's `Generated_Course__c` (and that course's `TimeSlot__c` and `Enrollment__c` records) are **not** deleted or otherwise affected when the plan is deleted — the course keeps running independently of the plan that created it.
- [ ] Deleting a draft (unlocked) plan continues to behave as before.
- [ ] `CoursePlanHandlerTest` covers: deleting a locked plan succeeds and its generated course/time slots/enrollments still exist afterward; deleting a draft plan still works.

## Notes

`Generated_Course__c` is a plain lookup from `CoursePlan__c` to `Course__c` (`deleteConstraint: SetNull`) — there is no field on `Course__c` pointing back to the plan, so deleting a `CoursePlan__c` row today has no effect on its generated course. That means the fix is simply to remove/relax the `Status__c == 'Locked'` guard in `onBeforeDelete` — no explicit cleanup code is needed, since the schema was already set up so the course survives independently. Contrast with the deliberate cascade in `CoursePlanLockService.unlock`, which stays as the path for when the user *does* want the course torn down.

Follow-up cleanup item from task 024.

## Related migrations

None — behavior/Apex change only, no schema change.
