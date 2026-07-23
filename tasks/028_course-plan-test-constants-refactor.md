# 028 Refactor hardcoded picklist/text values in course plan tests

**Status:** done

## What

`CoursePlanControllerTest.cls`, `CoursePlanHandlerTest.cls`, and `coursePlanSchedule.test.js` repeat literal picklist values and other text inline. Pull the text that is referenced both in production code and in tests into named constants, and stop hardcoding picklist values that can change (like Classroom).

## Acceptance criteria

- [x] Text shared between production code and tests (e.g. status values, error message fragments) is defined once as a constant and referenced from both places.
- [x] Classroom value used in tests is either a constant declared at the top of each test class/file, or picked dynamically from the `Classroom__c` picklist's active values (not repeated as inline literals).
- [x] Day-of-week values remain hardcoded literals (acceptable, not expected to change).
- [x] All three files (`CoursePlanControllerTest.cls`, `CoursePlanHandlerTest.cls`, `coursePlanSchedule.test.js`) are updated consistently.
- [x] `sf apex run test --class-names CoursePlanControllerTest,CoursePlanHandlerTest --synchronous` passes.
- [x] LWC Jest suite for `coursePlanSchedule` passes.

## Notes

Follow-up cleanup item from task 024. Purely a refactor of test/code text — no behavior change expected.

## Related migrations

None — no schema change.
