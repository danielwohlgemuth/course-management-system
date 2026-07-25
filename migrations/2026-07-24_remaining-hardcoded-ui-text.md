# 2026-07-24 Remaining Hardcoded UI Text

## What Changed

Follow-up to `2026-07-24_course-plan-error-labels-expansion.md` (task 037), which was scoped to the CoursePlan locking/availability flow. This sweep moved the remaining hardcoded user-facing strings outside that scope into Custom Labels (task 038):

- **`CustomLabels.labels-meta.xml`** (20 new labels):
  - `coursePlanSchedule`: `CoursePlanSchedule_UnexpectedErrorMessage`, `CoursePlanSchedule_ViewCourseButtonLabel`, `CoursePlanSchedule_DayColumnHeader`, `CoursePlanSchedule_StartColumnHeader`, `CoursePlanSchedule_EndColumnHeader`, `CoursePlanSchedule_CardTitle`
  - `courseCalendar`: `CourseCalendar_SemesterFilterLabel`, `CourseCalendar_InstructorFilterLabel`, `CourseCalendar_CourseFilterLabel`, `CourseCalendar_ClassroomFilterLabel`, `CourseCalendar_LoadingSpinnerText`, `CourseCalendar_AllFilterOptionLabel`
  - `courseDownloadPdfReport`: `CourseDownloadPdfReport_ButtonLabel`
  - `Join_a_Course` flow: `Join_a_Course_SelectCoursesScreenLabel`, `Join_a_Course_EnrollmentErrorScreenLabel`, `Join_a_Course_EnrollmentConfirmedScreenLabel`, `Join_a_Course_AvailableCoursesLabel`, `Join_a_Course_CourseNumberColumnLabel`, `Join_a_Course_CourseNameColumnLabel`, `Join_a_Course_InstructorColumnLabel`
- **`coursePlanSchedule` LWC**: `extractMessage` fallback, the "View generated course" button, the Day/Start/End table headers, and the `lightning-card` title now come from labels via `@salesforce/label/c.<LabelName>` imports and getters.
- **`courseCalendar` LWC**: the four filter combobox labels, the spinner's `alternative-text`, and the repeated `{ label: 'All', value: '' }` default filter option now come from labels.
- **`courseDownloadPdfReport` LWC**: the button label now comes from a label (this component previously had no label imports at all).
- **`Join_a_Course` flow**: the 3 screen `<label>` elements, the datatable's `label` input, and the `columns` JSON's `customHeaderLabel`/`label` values now reference `{!$Label.<name>}` merge fields instead of inline text.
- **Jest tooling**: added 13 new `force-app/test/jest-mocks/label/<LabelName>.js` mock files for the new LWC label imports, following the pattern from task 037. No existing `jest.config.cjs` change was needed: the `moduleNameMapper` wildcard already added in task 037 covers any new `@salesforce/label/c.*` import.

### Validation rules were NOT converted (scope reduction from the original task)

Task 038 originally called for converting the `errorMessage` of 6 validation rules (`Availability__c/End_After_Start`, `Course__c/Instructor_User_Required`, `CoursePlan__c/Positive_Class_Counts`, `Enrollment__c/Student_Required`, `Enrollment__c/Student_Cannot_Change`, `Enrollment__c/Course_Cannot_Change`) to reference Custom Labels. This was attempted and then reverted after testing against a real scratch org:

- Deployed `errorMessage` as bare `$Label.LabelName` (the syntax Salesforce documents for validation rule formulas): the DML error returned the literal unresolved text `$Label.LabelName` instead of the label's value.
- Deployed `errorMessage` as `{!$Label.LabelName}` (the flow-style merge-field wrapper): same result, confirmed both via `AvailabilityHandlerTest.endAfterStartValidationTest` failing on the unresolved literal and via `sf data query --use-tooling-api "SELECT ErrorMessage FROM ValidationRule WHERE ValidationName='End_After_Start'"` showing the field stored exactly as authored (i.e., the deploy succeeded, but Salesforce does not evaluate the merge field at runtime for this field in this org/API version).

All 6 validation rules were reverted to their original inline literal `errorMessage` text, and the 6 Custom Labels that would have backed them were removed, both from `CustomLabels.labels-meta.xml` and, via a destructive-changes deploy, from the connected org (they had briefly existed there during testing). No functional change was made to these 6 validation rules as a result of this migration.

No object or field schema changed, so no data backfill is required.

## Deploy Steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/labels/CustomLabels.labels-meta.xml \
  --source-dir force-app/main/default/lwc/coursePlanSchedule \
  --source-dir force-app/main/default/lwc/courseCalendar \
  --source-dir force-app/main/default/lwc/courseDownloadPdfReport \
  --source-dir force-app/main/default/flows/Join_a_Course.flow-meta.xml

sf apex run test --test-level RunLocalTests --synchronous
npx jest
```

After deploying, open the `Join_a_Course` flow in an Experience Site (or via the existing Playwright recording script) and manually verify the three screens and the course datatable still render the expected text: flow merge-field substitution inside a component's JSON `columns` input parameter has no prior precedent in this codebase (task 037 only used `{!$Label.X}` inside plain `DisplayText` `fieldText`), so this is worth double-checking in a real org rather than assuming it behaves identically to the DisplayText case.

## Data Backfill

None required. Only UI text sources moved from inline strings to Custom Labels; no fields or records changed shape.

## Rollback

```bash
# Revert the updated LWCs and flow via git, then redeploy:
git checkout HEAD~1 -- \
  force-app/main/default/lwc/coursePlanSchedule \
  force-app/main/default/lwc/courseCalendar \
  force-app/main/default/lwc/courseDownloadPdfReport \
  force-app/main/default/flows/Join_a_Course.flow-meta.xml

sf project deploy start \
  --source-dir force-app/main/default/lwc/coursePlanSchedule \
  --source-dir force-app/main/default/lwc/courseCalendar \
  --source-dir force-app/main/default/lwc/courseDownloadPdfReport \
  --source-dir force-app/main/default/flows/Join_a_Course.flow-meta.xml

# Then remove the 20 new labels listed above from
# force-app/main/default/labels/CustomLabels.labels-meta.xml and redeploy it,
# or delete the labels in the org via Setup > Custom Labels.
# Also remove the 13 new files under force-app/test/jest-mocks/label/ listed
# in the "What Changed" section above.
```
