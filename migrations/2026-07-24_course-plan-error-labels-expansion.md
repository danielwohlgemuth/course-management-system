# 2026-07-24 Course Plan Error Labels Expansion

## What Changed

Follow-up to `2026-07-22_course-plan-scheduler-error-labels.md` (task 029), which was scoped only to `CoursePlanScheduler.cls`. Moved the remaining hardcoded user-facing error/helper text in the course-plan locking/availability flow into Custom Labels:

- **`CustomLabels.labels-meta.xml`** (18 new labels):
  - `CoursePlanHandler_ErrorEditLockedPlan`, `CoursePlanHandler_ErrorManualLock`, `CoursePlanHandler_ErrorSystemFieldsManaged`
  - `CoursePlanLockService_ErrorAlreadyLocked`, `CoursePlanLockService_ErrorNotLocked`
  - `CoursePlanController_ErrorNoAccess`
  - `AvailabilityHandler_ErrorNotDraft`
  - `CoursePlanSchedule_DraftHelpText`, `CoursePlanSchedule_ScheduledHelpText`, `CoursePlanSchedule_LockedErrorHelpText`, `CoursePlanSchedule_LockButtonLabel`, `CoursePlanSchedule_UnlockButtonLabel`, `CoursePlanSchedule_UnlockConfirmMessage` (`{0}` = enrollment warning clause), `CoursePlanSchedule_UnlockConfirmEnrollmentWarning` (`{0}` = enrollment count)
  - `CourseCalendar_ErrorLoadingSchedule`
  - `Join_a_Course_EnrollmentError`, `Join_a_Course_EnrollmentSuccess`
- **Apex** (`CoursePlanHandler.cls`, `CoursePlanLockService.cls`, `CoursePlanController.cls`, `AvailabilityHandler.cls`): existing `public static final String ERROR_*` constants now assign from `Label.<name>` instead of inline literals (constant names kept since existing tests reference them by name); `AvailabilityHandler.addError` now references `Label.AvailabilityHandler_ErrorNotDraft` directly.
- **LWC** (`coursePlanSchedule`, `courseCalendar`): markup and JS now import labels via `@salesforce/label/c.<LabelName>` instead of inline text. The unlock confirmation message uses a small local `formatLabel` helper for `{0}` placeholder substitution instead of string concatenation.
- **Flow** (`Join_a_Course.flow-meta.xml`): the two `DisplayText` screen fields (`Screen_Enrollment_Error`, `Screen_Success`) now reference `{!$Label.Join_a_Course_EnrollmentError}` / `{!$Label.Join_a_Course_EnrollmentSuccess}` instead of hardcoded HTML text.
- **Jest tooling**: added `force-app/test/jest-mocks/label/<LabelName>.js` mock files (one per label used by an LWC, each exporting the real English text) and a `moduleNameMapper` entry in `jest.config.cjs` mapping `@salesforce/label/c.*` imports to them: without this, `sfdx-lwc-jest`'s default fallback resolves label imports to the string `"c.<LabelName>"` rather than the label text, which would break every existing wording-based Jest assertion.

No object or field schema changed, so no data backfill is required.

## Deploy Steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/labels/CustomLabels.labels-meta.xml \
  --source-dir force-app/main/default/classes/CoursePlanHandler.cls \
  --source-dir force-app/main/default/classes/CoursePlanLockService.cls \
  --source-dir force-app/main/default/classes/CoursePlanController.cls \
  --source-dir force-app/main/default/classes/AvailabilityHandler.cls \
  --source-dir force-app/main/default/lwc/coursePlanSchedule \
  --source-dir force-app/main/default/lwc/courseCalendar \
  --source-dir force-app/main/default/flows/Join_a_Course.flow-meta.xml

sf apex run test --test-level RunLocalTests --synchronous
npx jest
```

## Data Backfill

None required. Only error/helper message wording sources moved from inline strings to Custom Labels; no fields or records changed shape.

## Rollback

```bash
# Revert the updated Apex, LWC, and flow files via git, then redeploy:
git checkout HEAD~1 -- \
  force-app/main/default/classes/CoursePlanHandler.cls \
  force-app/main/default/classes/CoursePlanLockService.cls \
  force-app/main/default/classes/CoursePlanController.cls \
  force-app/main/default/classes/AvailabilityHandler.cls \
  force-app/main/default/lwc/coursePlanSchedule \
  force-app/main/default/lwc/courseCalendar \
  force-app/main/default/flows/Join_a_Course.flow-meta.xml \
  jest.config.cjs

sf project deploy start \
  --source-dir force-app/main/default/classes/CoursePlanHandler.cls \
  --source-dir force-app/main/default/classes/CoursePlanLockService.cls \
  --source-dir force-app/main/default/classes/CoursePlanController.cls \
  --source-dir force-app/main/default/classes/AvailabilityHandler.cls \
  --source-dir force-app/main/default/lwc/coursePlanSchedule \
  --source-dir force-app/main/default/lwc/courseCalendar \
  --source-dir force-app/main/default/flows/Join_a_Course.flow-meta.xml

# Then remove the 18 new labels listed above from
# force-app/main/default/labels/CustomLabels.labels-meta.xml and redeploy it,
# or delete the labels in the org via Setup > Custom Labels.
# Also remove force-app/test/jest-mocks/label/ and its jest.config.cjs entry.
```
