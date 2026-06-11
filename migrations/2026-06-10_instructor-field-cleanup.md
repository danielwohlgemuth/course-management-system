# 2026-06-10 Instructor field cleanup

## What changed

- `Course__c.Instructor__c` (Text 255) removed from metadata and deleted from the org.
- `Course__c.Instructor_User__c` (Lookup → User) marked required (`<required>true</required>`).
- All references to `Instructor__c` updated to `Instructor_User__r.Name` in Apex, LWC, page layout, flexipage, list view, and permission sets.

## Pre-flight check

Before deploying, confirm every `Course__c` record has a non-null `Instructor_User__c`:

```soql
SELECT COUNT() FROM Course__c WHERE Instructor_User__c = NULL
```

The result must be **0**. If any records are unset, populate them via Data Loader or anonymous Apex before proceeding.

## Deploy steps

```bash
# 1. Deploy updated field (now required)
sf project deploy start \
  --source-dir force-app/main/default/objects/Course__c/fields/Instructor_User__c.field-meta.xml \
  --ignore-conflicts

# 2. Deploy Apex classes
sf project deploy start \
  --source-dir force-app/main/default/classes/CourseCalendarController.cls \
  --source-dir force-app/main/default/classes/CourseCalendarController.cls-meta.xml \
  --source-dir force-app/main/default/classes/CourseCalendarControllerTest.cls \
  --source-dir force-app/main/default/classes/CourseCalendarControllerTest.cls-meta.xml

# 3. Deploy LWC
sf project deploy start \
  --source-dir force-app/main/default/lwc/courseCalendar

# 4. Deploy layout, flexipage, list view, and permission sets
sf project deploy start \
  --source-dir force-app/main/default/layouts/Course__c-Course\ Layout.layout-meta.xml \
  --source-dir force-app/main/default/flexipages/Course_Record_Page.flexipage-meta.xml \
  --source-dir force-app/main/default/objects/Course__c/listViews/All_Courses.listView-meta.xml \
  --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml \
  --source-dir force-app/main/default/permissionsets/CourseStudent.permissionset-meta.xml \
  --source-dir force-app/main/default/permissionsets/CourseInstructor.permissionset-meta.xml

# 5. Delete the legacy field from the org
sf data delete record --sobject CustomField --where "DeveloperName='Instructor__c' AND TableEnumOrId='Course__c'"
# If the above fails, use Setup → Object Manager → Course → Fields → Instructor → Delete
# Or via Metadata API destructive change (see Rollback section)

# 6. Run all tests
sf apex run test --test-level RunLocalTests --synchronous
```

## Data backfill

Not required — this migration assumes task 002's backfill has already been run and verified (all records have a non-null `Instructor_User__c`).

## Rollback

To reverse:

1. Restore the `Instructor__c` field by redeploying [force-app/main/default/objects/Course__c/fields/Instructor__c.field-meta.xml](../force-app/main/default/objects/Course__c/fields/Instructor__c.field-meta.xml) from git history.
2. Set `<required>false</required>` on `Instructor_User__c` and redeploy.
3. Revert Apex, LWC, layout, flexipage, list view, and permission set files from git and redeploy.
