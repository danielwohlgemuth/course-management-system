# 029 Use custom labels for CoursePlanScheduler error messages

**Status:** done

## What

`CoursePlanScheduler.cls` builds several user-facing error messages (e.g. availability end-time-before-start-time, duration too long, insufficient weekly availability) as inline string literals and concatenations. Move these to Custom Labels so the wording is centrally managed and translatable, using templated/merge-field style substitution for the dynamic parts (durations, counts, etc.).

## Acceptance criteria

- [x] Each distinct error message in `CoursePlanScheduler.cls` has a corresponding new Custom Label.
- [x] Dynamic values (e.g. required duration, weekly class count) are inserted via label placeholders (`{0}`, `{1}`, ...) and `String.format`, not string concatenation.
- [x] No existing/pre-existing labels are reused or repurposed: only new labels are added for this feature's messages.
- [x] `CoursePlanControllerTest` / `CoursePlanSchedulerTest` assertions are updated to match the label-driven text. (No changes were needed: existing assertions use `.contains(...)` substring checks against wording that was preserved verbatim.)
- [x] `sf apex run test --class-names CoursePlanScheduler,CoursePlanSchedulerTest --synchronous` passes. (Run as two separate `--class-names` invocations, since `sf` only allows one class per synchronous run; `CoursePlanSchedulerTest` and `CoursePlanControllerTest` both pass.)

## Notes

Follow-up cleanup item from task 024.

## Related migrations

- `migrations/2026-07-22_course-plan-scheduler-error-labels.md`
