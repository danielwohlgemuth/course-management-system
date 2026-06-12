# 2026-06-11 — Add instructor Course__Share on insert/update

## What changed

`CourseHandler.onAfterInsert` now creates a `Course__Share` (AccessLevel = Edit, RowCause = Manual) for the `Instructor_User__c` when the instructor is not the record owner. A new `onAfterUpdate` handler keeps that share in sync when `Instructor_User__c` changes. `CourseTrigger` was extended to fire on `after update`.

Without this, instructors assigned via the `Instructor_User__c` lookup could not see their own courses in the calendar because `Course__c.sharingModel = Private` and their permission set does not grant View All.

## Deploy steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/triggers/CourseTrigger.trigger \
  --source-dir force-app/main/default/triggers/CourseTrigger.trigger-meta.xml \
  --source-dir force-app/main/default/classes/CourseHandler.cls \
  --source-dir force-app/main/default/classes/CourseHandler.cls-meta.xml \
  --source-dir force-app/main/default/classes/CourseHandlerTest.cls \
  --source-dir force-app/main/default/classes/CourseHandlerTest.cls-meta.xml

sf apex run test --class-names CourseHandlerTest --synchronous
```

## Data backfill

Existing courses have no instructor share. Run the following anonymous Apex to create shares for all courses where the instructor differs from the record owner:

```apex
List<Course__Share> shares = new List<Course__Share>();
for (Course__c c : [
    SELECT Id, OwnerId, Instructor_User__c
    FROM Course__c
    WHERE Instructor_User__c != null
]) {
    if (c.Instructor_User__c != c.OwnerId) {
        shares.add(new Course__Share(
            ParentId = c.Id,
            UserOrGroupId = c.Instructor_User__c,
            AccessLevel = 'Edit',
            RowCause = 'Manual'
        ));
    }
}
if (!shares.isEmpty()) {
    insert shares;
    System.debug('Inserted ' + shares.size() + ' instructor shares');
}
```

Run via Developer Console → Execute Anonymous, or:

```bash
sf apex run --file <path-to-script.apex>
```

## Rollback

Delete the manual instructor shares, then redeploy the previous versions of `CourseTrigger.trigger` and `CourseHandler.cls`.

```apex
delete [SELECT Id FROM Course__Share WHERE RowCause = 'Manual' AND UserOrGroupId IN (
    SELECT Instructor_User__c FROM Course__c WHERE Instructor_User__c != null
)];
```

> **Note:** This also deletes group shares if any group is ever used as an instructor value. Scope the delete more tightly if needed.
