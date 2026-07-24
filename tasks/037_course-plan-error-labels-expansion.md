# 037 Use custom labels for remaining CoursePlan-related error messages

**Status:** open

## What

Task 029 moved `CoursePlanScheduler.cls`'s error messages to Custom Labels but left several other user-facing error strings as inline literals/constants. Extend the same treatment to:

- `CoursePlanHandler.cls` (lines 6-8): `ERROR_EDIT_LOCKED_PLAN`, `ERROR_MANUAL_LOCK`, `ERROR_SYSTEM_FIELDS_MANAGED`
- `CoursePlanLockService.cls` (lines 12-13): `ERROR_ALREADY_LOCKED`, `ERROR_NOT_LOCKED`
- `CoursePlanController.cls` (line 2): `ERROR_NO_ACCESS`
- `AvailabilityHandler.cls` (lines 15-17): inline literal `'Availability windows can only be changed while the plan is in Draft status.'`

It also covers the equivalent user-facing text hardcoded in the `coursePlanSchedule` and `courseCalendar` LWCs, converted to Custom Labels imported via `@salesforce/label/c.<LabelName>`:

- `coursePlanSchedule.html` (lines 5-8): draft-state helper text ("This plan is a draft...")
- `coursePlanSchedule.html` (lines 18-21): scheduled-state helper text ("This plan is locked and its course has been generated...")
- `coursePlanSchedule.html` (lines 72-75): locked-with-error helper text ("The plan is locked but no schedule could be generated...")
- `coursePlanSchedule.html` (line 11) / `coursePlanSchedule.js` (line 26, `UNLOCK_BUTTON_LABEL`): the "Lock plan" / "Unlock plan" button labels
- `coursePlanSchedule.js` (lines 116-117): the `LightningConfirm` message template ("Unlocking deletes the generated course and its schedule...")
- `courseCalendar.html` (line 85): "Failed to load schedule. Please refresh."

It also covers the two screen display-text messages hardcoded in the `Join_a_Course` flow, referenced via the `{!$Label.<LabelName>}` merge syntax:

- `Join_a_Course.flow-meta.xml` (`Screen_Enrollment_Error`, lines 192-193): "Unable to complete your enrollment. A system error occurred. Please try again or contact your administrator."
- `Join_a_Course.flow-meta.xml` (`Screen_Success`, lines 309-310): "You have successfully enrolled in the selected course(s). You now have read access to the course materials."

## Acceptance criteria

- [ ] Each distinct error/helper message above (Apex and LWC) has a corresponding new Custom Label.
- [ ] No existing/pre-existing labels (including the ones added in task 029) are reused or repurposed: only new labels are added for this feature's messages.
- [ ] Apex callers reference the label instead of the string constant/literal; string constants that become unused are removed.
- [ ] LWC markup/JS reference labels imported from `@salesforce/label/c.<LabelName>` instead of inline text; dynamic parts (e.g. the enrollment-count warning in the unlock confirm message) use label placeholder substitution, not string concatenation.
- [ ] `Join_a_Course` flow's two screen display-text fields reference Custom Labels via `{!$Label.<LabelName>}` instead of hardcoded HTML text.
- [ ] Existing test assertions in `CoursePlanHandlerTest`, `CoursePlanLockServiceTest`, `CoursePlanControllerTest`, `AvailabilityHandlerTest`, and the Jest tests for `coursePlanSchedule`/`courseCalendar` (or equivalents) are updated to match the label-driven text if wording changes, otherwise confirmed to still pass.
- [ ] `sf apex run test --test-level RunLocalTests --synchronous` passes.
- [ ] Jest tests for the affected LWCs pass.
- [ ] Manually verify (or via existing Playwright recording script) that the `Join_a_Course` flow's error and success screens still render the expected text after the label swap.

## Notes

Follow-up to task 029, which was scoped too narrowly to `CoursePlanScheduler.cls` only. This task closes the gap for the other classes in the course-plan locking/availability flow, the equivalent hardcoded text in the `coursePlanSchedule` and `courseCalendar` LWCs, and the two screen messages in the `Join_a_Course` flow.

## Related migrations

- `migrations/YYYY-MM-DD_<slug>.md` (add once a migration is written)
