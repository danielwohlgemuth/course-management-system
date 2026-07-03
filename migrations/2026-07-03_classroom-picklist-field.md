# Classroom picklist field on Course object

## What changed

- New field `Classroom__c` (Picklist, restricted, not required) on `Course__c` — records which room a course meets in. Values: `Room 101`, `Room 102`, `Room 103`, `Room 104`. Add new values here as facilities change.
- `Classroom__c` added to the `Course__c-Course Layout` page layout (Information section) and to the `Course_Record_Page` Lightning record page, so users can see/edit it on the record detail page.
- `CourseAdmin`, `CourseInstructor`, and `CourseStudent` permission sets updated with field-level security for `Course__c.Classroom__c` — editable for admins, read-only for instructors/students (same split as `Semester__c`). Without this, the new field is invisible in SOQL/UI to anyone without object-level "View All Data" — new custom fields are not automatically visible via FLS in this org.
- `Classroom__c` added as a column to the `All_Courses` and `Current_Semester_Courses` list views.
- `CoursePdfReportController.cls` now also selects `Classroom__c`; `CoursePdfReport.page` renders it as a labeled row in the PDF report body.

## Deploy steps

```bash
sf project deploy start --source-dir force-app/main/default/objects/Course__c/fields/Classroom__c.field-meta.xml
sf project deploy start --source-dir "force-app/main/default/layouts/Course__c-Course Layout.layout-meta.xml" \
                                     force-app/main/default/flexipages/Course_Record_Page.flexipage-meta.xml
sf project deploy start --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml \
                                     force-app/main/default/permissionsets/CourseInstructor.permissionset-meta.xml \
                                     force-app/main/default/permissionsets/CourseStudent.permissionset-meta.xml
sf project deploy start --source-dir force-app/main/default/objects/Course__c/listViews/All_Courses.listView-meta.xml \
                                     force-app/main/default/objects/Course__c/listViews/Current_Semester_Courses.listView-meta.xml
sf project deploy start --source-dir force-app/main/default/classes/CoursePdfReportController.cls \
                                     force-app/main/default/classes/CoursePdfReportControllerTest.cls \
                                     force-app/main/default/pages/CoursePdfReport.page
```

Or deploy everything at once:

```bash
sf project deploy start --source-dir force-app
```

## Data backfill

None required. `Classroom__c` is optional — existing `Course__c` records are left with a blank value and can be set by instructors/admins as they assign rooms going forward.

## Rollback

1. Revert `CoursePdfReportController.cls` to drop `Classroom__c` from the SELECT, and revert `CoursePdfReport.page` to remove the Classroom row, then redeploy.
2. Remove the `Classroom__c` column from `All_Courses.listView-meta.xml` and `Current_Semester_Courses.listView-meta.xml` and redeploy.
3. Remove the `Course__c.Classroom__c` field permission entries from `CourseAdmin`, `CourseInstructor`, and `CourseStudent` permission sets and redeploy.
4. Remove the `Classroom__c` field instance from `Course__c-Course Layout.layout-meta.xml` and `Course_Record_Page.flexipage-meta.xml` and redeploy.
5. Delete the `Course__c.Classroom__c` field via Setup > Object Manager > Course > Fields & Relationships, or via a destructive changes manifest.
