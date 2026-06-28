# 2026-06-28 Error Logging Framework

## What Changed

Introduced a centralized, Platform Event-based error logging pipeline:

- **`Error_Logged__e`** — new Platform Event (`PublishImmediately`) with fields: `Source_Type__c`, `Source_Name__c`, `Message__c`, `Stack_Trace__c`, `User_Id__c`
- **`Error_Log__c`** — new custom object (auto-number `ERR-{0000}`) with fields: `Source_Type__c` (picklist: Flow/Apex/LWC), `Source_Name__c`, `Message__c`, `Stack_Trace__c`, `User__c` (Lookup → User), `Occurred_At__c`
- **`Error_Log__c` tab** — new custom tab for list view access
- **4 list views** on `Error_Log__c`: All Error Logs, Flow Errors, Apex Errors, LWC Errors
- **`ErrorLogService`** — new Apex class (`without sharing`) with `log()`, `logFromLwc()` (`@AuraEnabled`), and `logFromFlow()` (`@InvocableMethod`)
- **`ErrorLoggedTrigger`** — new trigger on `Error_Logged__e` that inserts `Error_Log__c` records
- **`errorLogger`** — new LWC service module that calls `ErrorLogService.logFromLwc` from components
- **`CourseAdmin` permission set** — updated: read access on `Error_Log__c`, tab visibility, `ErrorLogService` Apex class access
- **`CourseHandler`** — updated: try/catch on all DML including `deleteGroupsAsync`
- **`EnrollmentHandler`** — updated: try/catch on all methods including `@future` group member methods
- **`Join_a_Course` flow** — updated: fault path now calls `ErrorLogService` via Apex action before showing the error screen
- **`courseCalendar` LWC** — updated: wire error handlers now call `logError` from `c/errorLogger`

## Deploy Steps

```bash
# 1. Platform Event + Error_Log__c object, fields, tab
sf project deploy start --source-dir force-app/main/default/objects/Error_Logged__e
sf project deploy start --source-dir force-app/main/default/objects/Error_Log__c
sf project deploy start --source-dir force-app/main/default/tabs/Error_Log__c.tab-meta.xml

# 2. Service class + PE trigger + tests
sf project deploy start \
  --source-dir force-app/main/default/classes/ErrorLogService.cls \
  --source-dir force-app/main/default/classes/ErrorLogService.cls-meta.xml \
  --source-dir force-app/main/default/classes/ErrorLogServiceTest.cls \
  --source-dir force-app/main/default/classes/ErrorLogServiceTest.cls-meta.xml \
  --source-dir force-app/main/default/triggers/ErrorLoggedTrigger.trigger \
  --source-dir force-app/main/default/triggers/ErrorLoggedTrigger.trigger-meta.xml

# 3. Updated trigger handlers
sf project deploy start \
  --source-dir force-app/main/default/classes/CourseHandler.cls \
  --source-dir force-app/main/default/classes/CourseHandler.cls-meta.xml \
  --source-dir force-app/main/default/classes/EnrollmentHandler.cls \
  --source-dir force-app/main/default/classes/EnrollmentHandler.cls-meta.xml

# 4. Updated flow
sf project deploy start --source-dir force-app/main/default/flows/Join_a_Course.flow-meta.xml

# 5. errorLogger LWC module + updated courseCalendar
sf project deploy start \
  --source-dir force-app/main/default/lwc/errorLogger \
  --source-dir force-app/main/default/lwc/courseCalendar

# 6. Updated permission set
sf project deploy start \
  --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml

# 7. Run tests
sf apex run test --class-names ErrorLogServiceTest --synchronous
```

## Data Backfill

None required. `Error_Log__c` starts empty; records are created going forward by the trigger.

## Rollback

```bash
# Revert updated files to their prior versions via git, then redeploy:
git checkout HEAD~1 -- \
  force-app/main/default/classes/CourseHandler.cls \
  force-app/main/default/classes/EnrollmentHandler.cls \
  force-app/main/default/flows/Join_a_Course.flow-meta.xml \
  force-app/main/default/lwc/courseCalendar/courseCalendar.js \
  force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml

sf project deploy start \
  --source-dir force-app/main/default/classes/CourseHandler.cls \
  --source-dir force-app/main/default/classes/EnrollmentHandler.cls \
  --source-dir force-app/main/default/flows/Join_a_Course.flow-meta.xml \
  --source-dir force-app/main/default/lwc/courseCalendar \
  --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml

# Then delete the new objects and files from the org via Setup > Object Manager,
# and remove the source files from the repo.
```
