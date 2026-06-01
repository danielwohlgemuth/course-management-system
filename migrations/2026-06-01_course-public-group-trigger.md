# 2026-06-01 Course Public Group Trigger

## What changed

- Added `Public_Group_Id__c` (Text 18) field to `Course__c` to store the linked public group Id.
- Added `CourseHandler` Apex class: creates a `Regular` public group on Course insert, writes back `Public_Group_Id__c`, creates a `Course__Share` (Read access); deletes the group on Course delete.
- Added `CourseTrigger` Apex trigger on `Course__c` (`after insert`, `before delete`) that delegates to `CourseHandler`.
- Added `CourseHandlerTest` Apex test class covering single insert, bulk insert, delete, and null-guard scenarios.
- Updated `CourseAdmin`, `CourseInstructor`, and `CourseStudent` permission sets to expose `Public_Group_Id__c` (Admin: edit; Instructor and Student: read-only).

## Deploy steps

Run in order:

### 1. Deploy the new field

```bash
sf project deploy start \
  --source-dir force-app/main/default/objects/Course__c/fields/Public_Group_Id__c.field-meta.xml
```

### 2. Deploy the trigger and handler class

```bash
sf project deploy start \
  --source-dir force-app/main/default/classes/CourseHandler.cls \
  --source-dir force-app/main/default/classes/CourseHandler.cls-meta.xml \
  --source-dir force-app/main/default/classes/CourseHandlerTest.cls \
  --source-dir force-app/main/default/classes/CourseHandlerTest.cls-meta.xml \
  --source-dir force-app/main/default/triggers/CourseTrigger.trigger \
  --source-dir force-app/main/default/triggers/CourseTrigger.trigger-meta.xml
```

### 3. Deploy updated permission sets

```bash
sf project deploy start \
  --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml \
  --source-dir force-app/main/default/permissionsets/CourseInstructor.permissionset-meta.xml \
  --source-dir force-app/main/default/permissionsets/CourseStudent.permissionset-meta.xml
```

### 4. Run tests

```bash
sf apex run test --class-names CourseHandlerTest --synchronous
```

## Data backfill

Existing `Course__c` records will have `Public_Group_Id__c = null` and no associated group. To backfire them, execute the following as Anonymous Apex:

```apex
List<Course__c> courses = [SELECT Id, Course_Name__c FROM Course__c WHERE Public_Group_Id__c = null];
if (courses.isEmpty()) return;

List<Group> groups = new List<Group>();
for (Course__c c : courses) {
    groups.add(new Group(Name = c.Course_Name__c, Type = 'Regular'));
}
insert groups;

List<Course__c> toUpdate = new List<Course__c>();
List<Course__Share> shares = new List<Course__Share>();
for (Integer i = 0; i < courses.size(); i++) {
    Id gId = groups[i].Id;
    toUpdate.add(new Course__c(Id = courses[i].Id, Public_Group_Id__c = gId));
    shares.add(new Course__Share(
        ParentId = courses[i].Id,
        UserOrGroupId = gId,
        AccessLevel = 'Read',
        RowCause = Schema.Course__Share.RowCause.Manual
    ));
}
update toUpdate;
insert shares;
System.debug('Backfilled ' + courses.size() + ' courses');
```

## Rollback

1. Delete all groups created by the backfill/trigger (query `Course__c.Public_Group_Id__c` for non-null values, delete those `Group` records).
2. Delete the trigger from the org via Setup → Apex Triggers, or deploy a destructive change.
3. Delete `CourseHandler` and `CourseHandlerTest` from the org.
4. Clear `Public_Group_Id__c` on all `Course__c` records, then undeploy the field.
5. Redeploy the three permission sets without the `Public_Group_Id__c` field entry.
