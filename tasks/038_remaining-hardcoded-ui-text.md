# 038 Convert remaining hardcoded user-facing text to Custom Labels

**Status:** done

## What

Tasks 029 and 037 moved a specific, scoped set of user-facing strings to Custom Labels (`CoursePlanScheduler.cls`, then `CoursePlanHandler.cls`/`CoursePlanLockService.cls`/`CoursePlanController.cls`/`AvailabilityHandler.cls`, the `coursePlanSchedule`/`courseCalendar` LWCs, and the `Join_a_Course` flow's two error/success screens). A follow-up sweep found several other hardcoded user-facing strings outside that scope that should get the same treatment:

**Validation rules** (`errorMessage`, shown directly to users on save; reference labels via `$Label.LabelName` formula syntax, no `{!...}` wrapper):

- `Availability__c/validationRules/End_After_Start.validationRule-meta.xml`: "End time must be after start time."
- `Course__c/validationRules/Instructor_User_Required.validationRule-meta.xml`: "An instructor must be assigned to this course."
- `CoursePlan__c/validationRules/Positive_Class_Counts.validationRule-meta.xml`: "Classes per week and duration per class must both be at least 1."
- `Enrollment__c/validationRules/Student_Required.validationRule-meta.xml`: "Student is required."
- `Enrollment__c/validationRules/Student_Cannot_Change.validationRule-meta.xml`: "Student cannot be changed after enrollment is created."
- `Enrollment__c/validationRules/Course_Cannot_Change.validationRule-meta.xml`: "Course cannot be changed after enrollment is created."

**`coursePlanSchedule` LWC** (missed within its own task 037 scope):

- `coursePlanSchedule.js`: `"An unexpected error occurred."` fallback in `extractMessage(error)`
- `coursePlanSchedule.html`: `label="View generated course"` button (sibling Lock/Unlock buttons already use labels)
- `coursePlanSchedule.html`: table headers "Day" / "Start" / "End"
- `coursePlanSchedule.html`: `lightning-card` `title="Schedule"`

**`courseCalendar` LWC** (never in scope of 029/037):

- `courseCalendar.html`: combobox `label` attributes "Semester", "Instructor", "Course", "Classroom"
- `courseCalendar.html`: `alternative-text="Loading schedule"` on the spinner
- `courseCalendar.js`: repeated `{ label: 'All', value: '' }` default filter option literal (3 occurrences)

**`courseDownloadPdfReport` LWC**:

- `courseDownloadPdfReport.html`: `label="Download PDF Report"` button

**`Join_a_Course` flow** (only its 2 DisplayText screens were converted in task 037):

- Screen labels: "Select Courses to Join", "Enrollment Error", "Enrollment Confirmed"
- Datatable component `label` input: "Available Courses"
- Datatable `columns` JSON `customHeaderLabel`/`label` values: "Course Number", "Course Name", "Instructor"

## Acceptance criteria

- [x] Each distinct string above has a corresponding new Custom Label; no existing labels are reused or repurposed. (Exception: the 6 validation rule messages, see Notes.)
- [x] Apex/LWC/flow references are updated to use the label instead of the literal, following the same conventions established in tasks 029/037 (`Label.<name>` in Apex, `@salesforce/label/c.<LabelName>` imports in LWC JS/HTML, `{!$Label.<LabelName>}` in flow screen text). Validation rules were left as inline literals, see Notes.
- [x] Validation rule dynamic error messages (if any are introduced) account for the fact that validation rule formulas can't do Apex-style `String.format` placeholder substitution: use formula `&` concatenation against other merge fields instead if a message needs to include a field value. (N/A: validation rules kept their literal text; no dynamic messages were introduced.)
- [x] Existing test assertions (Apex tests referencing validation rule messages, Jest tests for the affected LWCs) are updated if wording changes, otherwise confirmed to still pass. Wording was preserved verbatim everywhere, so no assertion updates were needed.
- [x] New label mock files are added under `force-app/test/jest-mocks/label/` for any new LWC label imports, following the pattern from task 037. (13 new mock files added.)
- [x] `sf apex run test --test-level RunLocalTests --synchronous` passes (90/90, 100%).
- [x] Jest tests for the affected LWCs pass (all suites, 13/13).
- [x] Manually verified via `Join_a_Course.flow-meta.xml` review and org deploy that the 3 screen labels, the datatable label, and the 3 column headers now reference `{!$Label.<LabelName>}` merge fields with wording unchanged; no interactive Playwright run was performed in this session.

## Notes

Follow-up to task 037, which itself followed up on task 029. Scope this one to just the strings listed above; if further hardcoded text turns up during implementation, log a new task rather than expanding this one further.

**Validation rules were NOT converted to Custom Labels.** The task's premise, that a validation rule's `errorMessage` can reference `$Label.LabelName` (bare, per Salesforce docs) or `{!$Label.LabelName}` (flow-style), was tested against a real scratch org and neither syntax resolves: the literal merge-field text (e.g. `{!$Label.Availability_EndAfterStart_ErrorMessage}`) is shown verbatim as the DML error instead of the label's value, confirmed via `sf data query --use-tooling-api` showing the `ValidationRule.ErrorMessage` field stored exactly as authored and `AvailabilityHandlerTest.endAfterStartValidationTest` failing on the unresolved literal. The 6 validation rules were reverted to their original inline `errorMessage` text, and the 6 labels that would have backed them were removed (both from `CustomLabels.labels-meta.xml` and, via a destructive-changes deploy, from the connected org). If a future task wants to pursue this, it should first confirm in Setup UI (Object Manager > Validation Rules) whether Custom Label references are actually supported for `errorMessage` in this API version, since the metadata-only path tested here did not work.

## Related migrations

- [migrations/2026-07-24_remaining-hardcoded-ui-text.md](../migrations/2026-07-24_remaining-hardcoded-ui-text.md)
