# 031 Add "Unscheduled" status to CoursePlan

**Status:** open

## What

`CoursePlan__c.Status__c` currently only has `Draft` and `Locked`. Today a scheduling failure leaves the plan in `Locked` status with `Scheduling_Error__c` populated, which looks identical to a successfully scheduled locked plan at a glance. Add a third value, `Unscheduled`, and set it (instead of `Locked`) whenever the Lock Plan action fails to produce a schedule.

## Acceptance criteria

- [ ] `Status__c` picklist has a new value `Unscheduled` alongside `Draft` and `Locked`.
- [ ] When `CoursePlanScheduler` fails to generate a schedule, the plan's status is set to `Unscheduled` (not `Locked`) and `Scheduling_Error__c` is populated as today.
- [ ] `CoursePlanHandler.onBeforeUpdate` treats `Unscheduled` consistently with `Locked` for edit-locking purposes (an unscheduled plan still can't be freely edited — it needs an explicit Unlock/retry action), unless product intent says otherwise.
- [ ] UI (coursePlanSchedule LWC) distinguishes `Unscheduled` from `Locked` when displaying plan status.
- [ ] Existing `CoursePlanSchedulerTest` / `CoursePlanHandlerTest` cases for the failure path are updated to assert `Unscheduled` status.

## Notes

Follow-up cleanup item from task 024. Confirm with product/UX whether `Unscheduled` plans should allow direct retry-lock or require unlocking back to `Draft` first before this is implemented.

## Related migrations

- `migrations/YYYY-MM-DD_courseplan-unscheduled-status.md` (add once written — adds a picklist value to `CoursePlan__c.Status__c`, may need to check any Global Value Set sharing before adding)
