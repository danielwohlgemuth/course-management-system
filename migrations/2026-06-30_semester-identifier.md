# Semester identifier on config metadata and Course object

## What changed

- New field `Semester__c` (Text, length 10) on `CourseCalendarConfig__mdt` — stores the current semester identifier, e.g. `2026 S1`.
- `CourseCalendarConfig.Default` record updated with `Semester__c = 2026 S1`.
- New field `Semester__c` (Picklist, restricted, not required) on `Course__c` — stamps each course with its semester. Currently has a single value, `2026 S1`; add new values here as new semesters begin.
- New formula field `Is_Current_Semester__c` (Checkbox) on `Course__c` — `TEXT(Semester__c) = $CustomMetadata.CourseCalendarConfig__mdt.Default.Semester__c` (picklist fields must be wrapped in `TEXT()` to compare against a text value in a formula). Recalculates automatically whenever the `Default` config record is redeployed with a new semester value.
- New list view `Current_Semester_Courses` ("Current Semester's Courses") on `Course__c`, filtered on `Is_Current_Semester__c = true`, columns `Name`, `Course_Name__c`, `Instructor_User__c`, `Semester__c`.
- `CourseCalendarController.getConfig()` now also selects `Semester__c`.
- `CourseAdmin`, `CourseInstructor`, and `CourseStudent` permission sets updated with field-level security for `Course__c.Semester__c` and `Course__c.Is_Current_Semester__c` (editable for admins, read-only for instructors/students). Without this, the new fields are invisible in SOQL/UI to anyone without object-level "View All Data" — new custom fields are not automatically visible via FLS in this org.
- `Semester__c` added to the `Course__c-Course Layout` page layout (Information section) and to the `Course_Record_Page` Lightning record page, so users can see/edit it on the record detail page.

## Deploy steps

```bash
sf project deploy start --source-dir force-app/main/default/objects/CourseCalendarConfig__mdt/fields/Semester__c.field-meta.xml
sf project deploy start --source-dir force-app/main/default/customMetadata/CourseCalendarConfig.Default.md-meta.xml
sf project deploy start --source-dir force-app/main/default/objects/Course__c/fields/Semester__c.field-meta.xml
sf project deploy start --source-dir force-app/main/default/objects/Course__c/fields/Is_Current_Semester__c.field-meta.xml
sf project deploy start --source-dir force-app/main/default/objects/Course__c/listViews/Current_Semester_Courses.listView-meta.xml
sf project deploy start --source-dir force-app/main/default/classes/CourseCalendarController.cls \
                                     force-app/main/default/classes/CourseCalendarControllerTest.cls
sf project deploy start --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml \
                                     force-app/main/default/permissionsets/CourseInstructor.permissionset-meta.xml \
                                     force-app/main/default/permissionsets/CourseStudent.permissionset-meta.xml
sf project deploy start --source-dir "force-app/main/default/layouts/Course__c-Course Layout.layout-meta.xml" \
                                     force-app/main/default/flexipages/Course_Record_Page.flexipage-meta.xml
```

Or deploy everything at once:

```bash
sf project deploy start --source-dir force-app
```

## Data backfill

`Is_Current_Semester__c` needs no backfill — it's a formula field and recalculates on read.

Existing `Course__c` records need `Semester__c` populated. Run the following anonymous Apex (adjust the value if backfilling to a semester other than the current default). A copy of this script lives at `scripts/apex/tmp/backfill_semester_picklist.apex`:

```apex
List<Course__c> coursesToUpdate = [
    SELECT Id
    FROM Course__c
    WHERE Semester__c = null
];
for (Course__c c : coursesToUpdate) {
    c.Semester__c = '2026 S1';
}
update coursesToUpdate;
System.debug('Backfilled Semester__c on ' + coursesToUpdate.size() + ' Course__c records.');
```

### If `Course__c.Semester__c` already exists as a Text field in the target org

Salesforce's Metadata API refuses to change a custom field's type while it has any data, and it also blocks deleting a field that's still referenced by a Lightning page, layout, or formula field. If an earlier deploy of this org already created `Semester__c` as Text, follow this sequence instead of a single deploy:

1. Null out `Semester__c` on all `Course__c` records (see `scripts/apex/tmp/clear_semester.apex`).
2. Temporarily remove the `Semester__c` references from `Course_Record_Page.flexipage-meta.xml` and `Course__c-Course Layout.layout-meta.xml`, and redeploy those two files.
3. Deploy a destructive-changes manifest deleting `Course__c.Semester__c` and `Course__c.Is_Current_Semester__c` (see `scripts/apex/tmp/destructive/`).
4. Deploy the Picklist `Semester__c.field-meta.xml`, then the `Is_Current_Semester__c.field-meta.xml` formula field.
5. Redeploy the layout, flexipage, list view, and permission sets to restore the field references.
6. Re-run the backfill script above.

## Manual step: pin the new list view as default

Salesforce has no deployable metadata attribute that sets a list view as the org-wide default for all users — "default" list view is a per-user pinned preference set from the Lightning UI. After deploying, each user (or an admin demonstrating the pin before broader rollout) should open the `Course__c` list view page, select **Current Semester's Courses**, and use **List View Controls > Pin List** to make it their default.

## Rollback

1. Remove the `Semester__c` field instance from `Course__c-Course Layout.layout-meta.xml` and `Course_Record_Page.flexipage-meta.xml` and redeploy.
2. Remove the `Course__c.Semester__c` and `Course__c.Is_Current_Semester__c` field permission entries from `CourseAdmin`, `CourseInstructor`, and `CourseStudent` permission sets and redeploy.
3. Revert `CourseCalendarController.cls` / `CourseCalendarControllerTest.cls` to drop `Semester__c` from `getConfig()`.
4. Delete the `Current_Semester_Courses` list view via Setup > Object Manager > Course > List Views, or redeploy without it using a destructive changes manifest.
5. Delete the `Is_Current_Semester__c` and `Course__c.Semester__c` fields via Setup > Object Manager > Course > Fields & Relationships, or via a destructive changes manifest.
6. Remove the `Semester__c` value from `CourseCalendarConfig.Default.md-meta.xml` and redeploy.
7. Delete the `CourseCalendarConfig__mdt.Semester__c` field via Setup > Custom Metadata Types > Course Calendar Config > Fields, or via a destructive changes manifest.
