# 2026-06-01 Student Permission Set

## What changed

Added `CourseStudent` permission set: read-only on `Course__c` and `TimeSlot__c`; create and read (no edit/delete) on `Enrollment__c`; read-only on `Course__c.Instructor__c`, `Enrollment__c.Student__c`, and `Enrollment__c.UniqueKey__c`.

## Deploy steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/permissionsets/CourseStudent.permissionset-meta.xml
```

## Data backfill

No data backfill needed. Assign to student/experience-site users via Setup → Permission Sets → CourseStudent → Manage Assignments, or with Anonymous Apex:

```apex
PermissionSet ps = [SELECT Id FROM PermissionSet WHERE Name = 'CourseStudent' LIMIT 1];
User u = [SELECT Id FROM User WHERE Username = 'student@example.com' LIMIT 1];
insert new PermissionSetAssignment(AssigneeId = u.Id, PermissionSetId = ps.Id);
```

## Rollback

Delete the `CourseStudent` permission set from the org via Setup → Permission Sets, or deploy a destructive change targeting `PermissionSet:CourseStudent`.
