# 2026-06-01 Instructor Permission Set

## What changed

Added `CourseInstructor` permission set: CRUD (no View All / Modify All) on `Course__c` and `TimeSlot__c`; read-only on `Enrollment__c`; read/edit on `Course__c.Instructor__c`; read-only on `Enrollment__c.Student__c` and `Enrollment__c.UniqueKey__c`; `Course__c` tab visible.

## Deploy steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/permissionsets/CourseInstructor.permissionset-meta.xml
```

## Data backfill

No data backfill needed. Assign the permission set to instructor users manually via Setup → Permission Sets → CourseInstructor → Manage Assignments, or with Anonymous Apex:

```apex
PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'CourseInstructor' LIMIT 1];
User u = [SELECT Id FROM User WHERE Username = 'instructor@example.com' LIMIT 1];
insert new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.Id);
```

## Rollback

Delete the `CourseInstructor` permission set from the org via Setup → Permission Sets, or deploy a destructive change targeting `PermissionSet:CourseInstructor`.
