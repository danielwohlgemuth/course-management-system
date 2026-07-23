# 2026-07-22 Course Plan Scheduler Error Labels

## What Changed

Moved the user-facing error messages built by `CoursePlanScheduler.cls` out of inline string literals/concatenations and into Custom Labels:

- **`CustomLabels.labels-meta.xml`** (new, 7 labels, category `Course Plan Scheduler`):
  - `CoursePlanScheduler_ErrorInvalidInputs`
  - `CoursePlanScheduler_ErrorNoAvailabilityWindows`
  - `CoursePlanScheduler_ErrorInvalidWindow` (`{0}` = day of week)
  - `CoursePlanScheduler_ErrorWindowTooShort` (`{0}` = required duration in minutes)
  - `CoursePlanScheduler_ErrorPartialSchedule` (`{0}` = classes placed, `{1}` = classes requested)
  - `CoursePlanScheduler_ErrorExistingConflicts` (`{0}` = classroom name)
  - `CoursePlanScheduler_ErrorUnlockPlan`
- **`CoursePlanScheduler.cls`** (updated): all error message construction now uses `Label.<name>` and `String.format`, with the same wording as before. `ERROR_NO_AVAILABILITY_WINDOWS` now delegates to `Label.CoursePlanScheduler_ErrorNoAvailabilityWindows` instead of holding a literal.

No object or field schema changed, so no data backfill is required.

## Deploy Steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/labels/CustomLabels.labels-meta.xml \
  --source-dir force-app/main/default/classes/CoursePlanScheduler.cls \
  --source-dir force-app/main/default/classes/CoursePlanScheduler.cls-meta.xml

sf apex run test --class-names CoursePlanSchedulerTest --synchronous
sf apex run test --class-names CoursePlanControllerTest --synchronous
```

## Data Backfill

None required. No fields or records changed shape; only error message wording sources moved from inline strings to Custom Labels.

## Rollback

```bash
# Revert the updated class to its prior version via git, then redeploy:
git checkout HEAD~1 -- force-app/main/default/classes/CoursePlanScheduler.cls

sf project deploy start \
  --source-dir force-app/main/default/classes/CoursePlanScheduler.cls \
  --source-dir force-app/main/default/classes/CoursePlanScheduler.cls-meta.xml

# Then remove the 7 CoursePlanScheduler_Error* entries from
# force-app/main/default/labels/CustomLabels.labels-meta.xml and redeploy it,
# or delete the labels in the org via Setup > Custom Labels.
```
