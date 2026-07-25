# 031 Add "Unscheduled" status to CoursePlan

**Status:** done

## What

`CoursePlan__c.Status__c` currently only has `Draft` and `Locked`. Today a scheduling failure leaves the plan in `Locked` status with `Scheduling_Error__c` populated, which looks identical to a successfully scheduled locked plan at a glance. Add a third value, `Unscheduled`, and set it (instead of `Locked`) whenever the Lock Plan action fails to produce a schedule.

## Acceptance criteria

- [x] `Status__c` picklist has a new value `Unscheduled` alongside `Draft` and `Locked`.
- [x] When `CoursePlanScheduler` fails to generate a schedule, the plan's status is set to `Unscheduled` (not `Locked`) and `Scheduling_Error__c` is populated as today.
- [x] `CoursePlanHandler.onBeforeUpdate` treats `Unscheduled` consistently with `Locked` for edit-locking purposes (an unscheduled plan still can't be freely edited: it needs an explicit Unlock/retry action), unless product intent says otherwise.
- [x] UI (coursePlanSchedule LWC) distinguishes `Unscheduled` from `Locked` when displaying plan status.
- [x] Existing `CoursePlanSchedulerTest` / `CoursePlanHandlerTest` cases for the failure path are updated to assert `Unscheduled` status.

## Notes

Follow-up cleanup item from task 024. Product confirmed: `Unscheduled` plans require an explicit Unlock back to `Draft` before retrying the Lock Plan action; there is no direct retry-lock from `Unscheduled`. The actual failure-path status write lives in `CoursePlanLockService.lock()` (not `CoursePlanScheduler`, which is a pure algorithm with no DML); failure-path assertions were added/updated in `CoursePlanControllerTest` and `CoursePlanHandlerTest`.

## Related migrations

- `migrations/2026-07-24_courseplan-unscheduled-status.md`: adds the `Unscheduled` picklist value to `CoursePlan__c.Status__c` (object-local, not a Global Value Set), updates `CoursePlanLockService`/`CoursePlanHandler`/`coursePlanSchedule` LWC, and includes a backfill script for existing locked-but-unscheduled plans.
