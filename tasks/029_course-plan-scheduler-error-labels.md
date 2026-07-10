# 029 Use custom labels for CoursePlanScheduler error messages

**Status:** open

## What

`CoursePlanScheduler.cls` builds several user-facing error messages (e.g. availability end-time-before-start-time, duration too long, insufficient weekly availability) as inline string literals and concatenations. Move these to Custom Labels so the wording is centrally managed and translatable, using templated/merge-field style substitution for the dynamic parts (durations, counts, etc.).

## Acceptance criteria

- [ ] Each distinct error message in `CoursePlanScheduler.cls` has a corresponding new Custom Label.
- [ ] Dynamic values (e.g. required duration, weekly class count) are inserted via label placeholders (`{0}`, `{1}`, ...) and `String.format`, not string concatenation.
- [ ] No existing/pre-existing labels are reused or repurposed — only new labels are added for this feature's messages.
- [ ] `CoursePlanControllerTest` / `CoursePlanSchedulerTest` assertions are updated to match the label-driven text.
- [ ] `sf apex run test --class-names CoursePlanScheduler,CoursePlanSchedulerTest --synchronous` passes.

## Notes

Follow-up cleanup item from task 024.

## Related migrations

- `migrations/YYYY-MM-DD_course-plan-scheduler-error-labels.md` (add once written — introduces new Custom Label metadata)
