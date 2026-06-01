# 2026-06-01 Enrollment UniqueKey Flow and Validation Rules

## What changed

- **New flow**: `force-app/main/default/flows/Enrollment_Set_UniqueKey.flow-meta.xml`  
  Record-triggered after-insert flow that sets `UniqueKey__c` on `Enrollment__c` to `{CourseId}_{StudentId}`.
- **New validation rule**: `Student_Cannot_Change` — blocks changes to `Student__c` on existing records.
- **New validation rule**: `Course_Cannot_Change` — blocks changes to `Course__c` on existing records.
- **Updated field description**: `UniqueKey__c` description updated to reference the flow instead of a trigger.

## Deploy steps

```bash
# Deploy the flow
sf project deploy start \
  --source-dir force-app/main/default/flows/Enrollment_Set_UniqueKey.flow-meta.xml

# Deploy the two new validation rules and updated field description
sf project deploy start \
  --source-dir force-app/main/default/objects/Enrollment__c/validationRules/Student_Cannot_Change.validationRule-meta.xml \
  --source-dir force-app/main/default/objects/Enrollment__c/validationRules/Course_Cannot_Change.validationRule-meta.xml \
  --source-dir force-app/main/default/objects/Enrollment__c/fields/UniqueKey__c.field-meta.xml

# Run all tests to confirm nothing is broken
sf apex run test --test-level RunLocalTests --synchronous
```

## Data backfill

Existing `Enrollment__c` records created before this flow was deployed will have a blank `UniqueKey__c`. Run the following anonymous Apex to backfill them:

```apex
List<Enrollment__c> enrollments = [
    SELECT Id, Course__c, Student__c
    FROM Enrollment__c
    WHERE UniqueKey__c = null
];
for (Enrollment__c e : enrollments) {
    e.UniqueKey__c = e.Course__c + '_' + e.Student__c;
}
update enrollments;
```

> If any two existing records share the same Course + Student combination, the update will fail on the unique constraint. Investigate and remove the duplicate enrollment before running the backfill.

## Rollback

```bash
# Deactivate the flow in the org (cannot delete an active flow via CLI)
# 1. Open Setup > Flows, find "Enrollment Set UniqueKey", deactivate it, then delete it.

# Delete the validation rules
sf project deploy start \
  --source-dir force-app/main/default/objects/Enrollment__c/validationRules/Student_Cannot_Change.validationRule-meta.xml \
  --source-dir force-app/main/default/objects/Enrollment__c/validationRules/Course_Cannot_Change.validationRule-meta.xml
# Then deactivate both rules in the org UI or redeploy with <active>false</active>.
```
