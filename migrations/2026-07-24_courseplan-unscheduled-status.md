# 2026-07-24 CoursePlan Unscheduled Status

## What Changed

Follow-up cleanup item from task 024 (task 031). Previously a scheduling failure left a plan in `Locked` status with `Scheduling_Error__c` populated, indistinguishable at a glance from a successfully scheduled locked plan. Added a third `Status__c` picklist value, `Unscheduled`, and used it for the failure path instead.

- **`CoursePlan__c.Status__c`** (`force-app/main/default/objects/CoursePlan__c/fields/Status__c.field-meta.xml`): added the restricted picklist value `Unscheduled` alongside `Draft` and `Locked`. This is a plain object-local picklist (not a Global Value Set), so no cross-object coordination is needed.
- **`CoursePlanLockService.cls`**: added `STATUS_UNSCHEDULED = 'Unscheduled'`. `lock()`'s failure branch now sets `Status__c` to `STATUS_UNSCHEDULED` instead of `STATUS_LOCKED`. `unlock()`'s guard now accepts either `STATUS_LOCKED` or `STATUS_UNSCHEDULED` (both unlock back to `Draft`): per product decision, an unscheduled plan must be explicitly unlocked back to `Draft` before retrying; there is no direct retry-lock from `Unscheduled`.
- **`CoursePlanHandler.cls`**: `onBeforeUpdate` now treats `Unscheduled` the same as `Locked` for edit-locking: an unscheduled plan can't be freely edited, and manually flipping `Status__c` to either `Locked` or `Unscheduled` outside `CoursePlanLockService` is blocked.
- **`CustomLabels.labels-meta.xml`**: renamed `CoursePlanSchedule_LockedErrorHelpText` to `CoursePlanSchedule_UnscheduledHelpText` (text updated from "The plan is locked but no schedule could be generated..." to "This plan could not be scheduled...") since the UI now keys off the real `Unscheduled` status rather than inferring it from `Locked` + no generated course.
- **LWC `coursePlanSchedule`**: added an exported `STATUS_UNSCHEDULED` constant; replaced the `isLockedWithError` getter (which inferred failure from `Locked` + no `Generated_Course__c`) with `isUnscheduled`, which checks `status === STATUS_UNSCHEDULED` directly.
- **Jest tooling**: renamed the corresponding label mock file to `force-app/test/jest-mocks/label/CoursePlanSchedule_UnscheduledHelpText.js`.

## Deploy Steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/objects/CoursePlan__c/fields/Status__c.field-meta.xml \
  --source-dir force-app/main/default/classes/CoursePlanLockService.cls \
  --source-dir force-app/main/default/classes/CoursePlanHandler.cls \
  --source-dir force-app/main/default/labels/CustomLabels.labels-meta.xml \
  --source-dir force-app/main/default/lwc/coursePlanSchedule

sf apex run test --test-level RunLocalTests --synchronous
npx jest
```

## Data Backfill

None required for new plans; `lock()` will start writing `Unscheduled` going forward.

Existing plans that are `Locked` with `Scheduling_Error__c` populated (i.e. locked-but-unscheduled under the old scheme) should be backfilled to `Unscheduled` so they read correctly in the UI. Run in Anonymous Apex (or Data Loader) against a sandbox/prod org before or right after deploying:

```apex
List<CoursePlan__c> staleUnscheduled = [
  SELECT Id
  FROM CoursePlan__c
  WHERE Status__c = 'Locked' AND Scheduling_Error__c != null
];
for (CoursePlan__c plan : staleUnscheduled) {
  plan.Status__c = 'Unscheduled';
}
CoursePlanHandler.bypassLockEnforcement = true;
try {
  update staleUnscheduled;
} finally {
  CoursePlanHandler.bypassLockEnforcement = false;
}
```

## Rollback

```bash
git checkout HEAD~1 -- \
  force-app/main/default/objects/CoursePlan__c/fields/Status__c.field-meta.xml \
  force-app/main/default/classes/CoursePlanLockService.cls \
  force-app/main/default/classes/CoursePlanHandler.cls \
  force-app/main/default/labels/CustomLabels.labels-meta.xml \
  force-app/main/default/lwc/coursePlanSchedule

sf project deploy start \
  --source-dir force-app/main/default/objects/CoursePlan__c/fields/Status__c.field-meta.xml \
  --source-dir force-app/main/default/classes/CoursePlanLockService.cls \
  --source-dir force-app/main/default/classes/CoursePlanHandler.cls \
  --source-dir force-app/main/default/labels/CustomLabels.labels-meta.xml \
  --source-dir force-app/main/default/lwc/coursePlanSchedule

# Revert any plans backfilled to Unscheduled back to Locked if needed:
# UPDATE CoursePlan__c SET Status__c = 'Locked' WHERE Status__c = 'Unscheduled'
```
