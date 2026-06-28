# 019 Set up error logging framework

**Status:** done

## What

Introduce a lightweight, centralized error logging framework that captures errors from Flows, Apex, and LWC in a single queryable location. Errors should be stored in a custom `Error_Log__c` object with enough context (source type, source name, message, stack trace, running user, timestamp) to diagnose issues without enabling debug logs in production.

## Acceptance criteria

- [ ] `Error_Log__c` custom object created with fields: `Source_Type__c` (picklist: Flow / Apex / LWC), `Source_Name__c` (text), `Message__c` (long text), `Stack_Trace__c` (long text), `User__c` (lookup to User), `Occurred_At__c` (date/time)
- [ ] `ErrorLogService` Apex class with a static `log()` method that inserts an `Error_Log__c` record; runs `without sharing` so it can always write regardless of the calling context
- [ ] `ErrorLogServiceTest` Apex test class with ≥ 75 % coverage
- [ ] `Join_a_Course` flow fault connector on `Create_Enrollment` updated to call `ErrorLogService.log()` (via Apex action) before showing `Screen_Enrollment_Error`
- [ ] An LWC utility module (`errorLogger`) that calls an Apex `@AuraEnabled` method to write an `Error_Log__c` record, usable from any component
- [ ] Migration file added for the new object and fields
- [ ] `Error_Log__c` is accessible to Course Admin permission set (read/create)

## Notes

Keep the `log()` API simple: `ErrorLogService.log(String sourceType, String sourceName, String message, String stackTrace)`. A future task can add a Platform Event variant for async logging if volume demands it.

## Related migrations

- `migrations/2026-06-28_error-log-object.md`
