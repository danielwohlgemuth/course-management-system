# 038 Convert remaining hardcoded user-facing text to Custom Labels

**Status:** open

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

- [ ] Each distinct string above has a corresponding new Custom Label; no existing labels are reused or repurposed.
- [ ] Apex/LWC/flow references are updated to use the label instead of the literal, following the same conventions established in tasks 029/037 (`Label.<name>` in Apex, `@salesforce/label/c.<LabelName>` imports in LWC JS/HTML, `{!$Label.<LabelName>}` in flow screen text, `$Label.<LabelName>` formula syntax in validation rule `errorMessage`).
- [ ] Validation rule dynamic error messages (if any are introduced) account for the fact that validation rule formulas can't do Apex-style `String.format` placeholder substitution: use formula `&` concatenation against other merge fields instead if a message needs to include a field value.
- [ ] Existing test assertions (Apex tests referencing validation rule messages, Jest tests for the affected LWCs) are updated if wording changes, otherwise confirmed to still pass.
- [ ] New label mock files are added under `force-app/test/jest-mocks/label/` for any new LWC label imports, following the pattern from task 037.
- [ ] `sf apex run test --test-level RunLocalTests --synchronous` passes.
- [ ] Jest tests for the affected LWCs pass.
- [ ] Manually verify (or via existing Playwright recording script) that the `Join_a_Course` flow's screens still render the expected text after the label swap.

## Notes

Follow-up to task 037, which itself followed up on task 029. Scope this one to just the strings listed above; if further hardcoded text turns up during implementation, log a new task rather than expanding this one further.

## Related migrations

- `migrations/YYYY-MM-DD_<slug>.md` (add once a migration is written)
