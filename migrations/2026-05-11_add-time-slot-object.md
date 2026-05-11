# 2026-05-11 — Add TimeSlot__c Object

## What Changed

New custom object `TimeSlot__c` with a Master-Detail relationship to `Course__c`. Captures the day of the week and start/end times for a course session.

**New metadata:**
- `objects/TimeSlot__c/TimeSlot__c.object-meta.xml` — object definition (AutoNumber name, ControlledByParent sharing)
- `objects/TimeSlot__c/fields/Course__c.field-meta.xml` — MasterDetail to Course__c (RelationshipName: TimeSlots)
- `objects/TimeSlot__c/fields/Day_of_Week__c.field-meta.xml` — required picklist (Monday–Sunday)
- `objects/TimeSlot__c/fields/Start_Time__c.field-meta.xml` — required Time field
- `objects/TimeSlot__c/fields/End_Time__c.field-meta.xml` — required Time field
- `permissionsets/CourseManagerAccess.permissionset-meta.xml` — object access + field-level read/edit for all TimeSlot__c fields

## Deploy Steps

```bash
sf project deploy start --source-dir force-app
```

## Data Backfill

No existing records to backfill. `TimeSlot__c` is a new object with no prior data.

## Rollback

```bash
sf project delete source --metadata CustomObject:TimeSlot__c
```

Remove the `TimeSlot__c` field permission and object permission blocks from `CourseManagerAccess.permissionset-meta.xml`, then redeploy the permission set:

```bash
sf project deploy start --source-dir force-app/main/default/permissionsets
```
