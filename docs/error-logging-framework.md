# Error Logging Framework

## Overview

The error logging framework captures errors from Flows, Apex, and LWC into a single queryable `Error_Log__c` object — without requiring debug logs in production.

The pipeline uses a Platform Event (`Error_Logged__e`) as an intermediary:

```
caller
  └─ ErrorLogService.log()
       └─ EventBus.publish(Error_Logged__e)   ← PublishImmediately
            └─ ErrorLoggedTrigger (async, own transaction)
                 └─ insert Error_Log__c
```

**Why Platform Events?**

- **Transaction isolation** — the `Error_Log__c` insert runs in its own transaction; a failure there cannot roll back the caller's business operation.
- **PublishImmediately** — the event fires even if the publishing transaction rolls back. Errors that cause rollbacks (the most important cases) are still captured.
- **MIXED_DML resolution** — `EventBus.publish()` is allowed from any Apex context, including `@future` methods that already perform setup-object DML (`GroupMember`, `Group`). This means logging works everywhere without workarounds.

---

## Data Model

### `Error_Logged__e` (Platform Event)

| Field | Type | Notes |
|---|---|---|
| `Source_Type__c` | Text(255) | `Flow`, `Apex`, or `LWC` |
| `Source_Name__c` | Text(255) | Class/method name, component name, or flow name |
| `Message__c` | LongTextArea | Exception message or error description |
| `Stack_Trace__c` | LongTextArea | Stack trace string (empty for Flow/LWC) |
| `User_Id__c` | Text(18) | Raw Salesforce User ID |

### `Error_Log__c` (Custom Object, auto-number `ERR-{0000}`)

| Field | Type | Notes |
|---|---|---|
| `Source_Type__c` | Picklist | Flow / Apex / LWC |
| `Source_Name__c` | Text(255) | |
| `Message__c` | LongTextArea | |
| `Stack_Trace__c` | LongTextArea | |
| `User__c` | Lookup → User | |
| `Occurred_At__c` | DateTime | Set from `evt.CreatedDate` by the PE trigger |

---

## Logging from Apex

Call `ErrorLogService.log()` from a try/catch block. Re-throw the exception after logging so the calling transaction still fails as expected.

```apex
try {
    insert records;
} catch (Exception e) {
    ErrorLogService.log('Apex', 'MyClass.myMethod', e.getMessage(), e.getStackTraceString());
    throw e;
}
```

This works in all Apex contexts: regular triggers, `@future` methods, batch jobs, queueable jobs.

**Do not re-throw in `@future` methods** — async failures are fire-and-forget; there is no caller context to propagate to:

```apex
@future
private static void doAsyncWork(List<Id> ids) {
    try {
        // ... DML ...
    } catch (Exception e) {
        ErrorLogService.log('Apex', 'MyClass.doAsyncWork', e.getMessage(), e.getStackTraceString());
        // no re-throw
    }
}
```

---

## Logging from LWC

Import the `errorLogger` service module and call `logError()` in wire error handlers or catch blocks.

```javascript
import { logError } from 'c/errorLogger';

// In a @wire error handler:
wiredMyData({ data, error }) {
    if (data) {
        // handle data
    } else if (error) {
        this.error = error;
        logError('myComponent', 'wiredMyData: ' + JSON.stringify(error), '');
    }
}
```

`logError` is fire-and-forget — it never throws. Stack traces are not available in LWC wire handlers; pass an empty string.

---

## Logging from Flows

On any fault path, add an Apex Action element before the error screen:

1. Action Type: **Apex**
2. Apex Class: **ErrorLogService**
3. Input parameters:
   - `sourceName` → your flow's API name (e.g. `Join_a_Course`)
   - `message` → `{!$Flow.FaultMessage}`
   - `stackTrace` → *(leave empty)*
4. Connect the action's output connector to your error screen element.

The action uses `@InvocableMethod` and publishes a `PublishImmediately` Platform Event, so the log is captured even though the fault path itself is a partial-rollback context.

---

## Viewing Logs

Navigate to the **Error Log** tab in the Course Manager app (visible to Course Admin users). Four list views are available:

| List View | Filter |
|---|---|
| All Error Logs | None |
| Flow Errors | `Source_Type__c = Flow` |
| Apex Errors | `Source_Type__c = Apex` |
| LWC Errors | `Source_Type__c = LWC` |

`Stack_Trace__c` is not shown in list views (too wide); open a record to see the full trace.

---

## Permissions

`Error_Log__c` records are written by `ErrorLoggedTrigger`, which runs without sharing — no object permission is needed to write logs. The **Course Admin** permission set grants:

- Read access to `Error_Log__c` and all its fields
- `Error_Log__c` tab visibility
- `ErrorLogService` Apex class access (required for `@AuraEnabled` LWC calls)

Students and Instructors do not have access to error logs by design.

---

## Governor Limit Notes

Each `ErrorLogService.log()` call publishes one Platform Event (1 DML statement, 1 row). The event is delivered asynchronously; the trigger consumes a separate DML budget.

In bulk trigger contexts where many records fail simultaneously, each failure in a loop would call `log()` separately. To avoid hitting DML limits in extreme cases, collect errors and call `log()` once with a combined message, or defer to a single summary call after the loop.
