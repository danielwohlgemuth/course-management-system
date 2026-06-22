# 2026-06-22 Add Instructor_Name__c formula field and update Join a Course flow

## What changed

- New formula field `Course__c.Instructor_Name__c` (Text) — computes the instructor's full name from the `Instructor_User__c` lookup using `FirstName` and `LastName`. Cross-object compound `Name` field is not referenceable in formulas, so the name is concatenated from its components.
- `Join_a_Course` flow — `Get_All_Courses` converted from explicit-`queriedFields` mode to `storeOutputAutomatically` (matching the pattern already used by the now-removed duplicate step). Redundant `Copy_2_of_Get_All_Courses` lookup and the unused `allCourses` variable were removed.
- Datatable `Instructor` column changed from `customReferenceLabel` on `Instructor_User__c` to plain `text` on `Instructor_Name__c`. The `customReferenceLabel` type makes async User lookups that fail silently in Experience Site community context.

## Deploy steps

```bash
# 1. Deploy the formula field first
sf project deploy start \
  --source-dir force-app/main/default/objects/Course__c/fields/Instructor_Name__c.field-meta.xml \
  --ignore-conflicts

# 2. Deploy the updated flow
sf project deploy start \
  --source-dir force-app/main/default/flows/Join_a_Course.flow-meta.xml \
  --ignore-conflicts
```

## Data backfill

None required. `Instructor_Name__c` is a formula field — values are computed at query time from existing `Instructor_User__c` data.

## Rollback

```bash
# Delete the formula field
sf project deploy start --metadata "CustomField:Course__c.Instructor_Name__c" --ignore-conflicts
# (then delete the file and deploy a version of the flow that reverts the column back to customReferenceLabel on Instructor_User__c)
```
