# 2026-05-27 — Add Enrollment__c Junction Object

## What Changed

New custom object `Enrollment__c` linking `Course__c` to a Salesforce User. Represents a student's membership in a course. Deleting a course cascade-deletes its enrollments via the master-detail relationship.

**New metadata:**
- `objects/Enrollment__c/Enrollment__c.object-meta.xml` — object definition (AutoNumber name, ControlledByParent sharing)
- `objects/Enrollment__c/fields/Course__c.field-meta.xml` — MasterDetail to Course__c (RelationshipName: Enrollments)
- `objects/Enrollment__c/fields/Student__c.field-meta.xml` — Lookup to User (RelationshipName: Enrollments); Salesforce does not allow Restrict/Cascade on User lookups, so required-ness is enforced by validation rule
- `objects/Enrollment__c/validationRules/Student_Required.validationRule-meta.xml` — blocks save when Student__c is blank
- `objects/Enrollment__c/fields/UniqueKey__c.field-meta.xml` — unique external ID text field enforcing one enrollment per student per course; populated by trigger (task 008)

## Deploy Steps

```bash
sf project deploy start --source-dir force-app/main/default/objects/Enrollment__c
```

## Data Backfill

No existing records to backfill. `Enrollment__c` is a new object with no prior data.

## Rollback

```bash
sf project delete source --metadata CustomObject:Enrollment__c
```
