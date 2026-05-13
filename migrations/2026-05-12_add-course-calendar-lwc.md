# 2026-05-12 — Add Course Calendar LWC

## What Changed

No schema changes — metadata and UI only.

- `CourseCalendarController` — new Apex class with a cacheable `@AuraEnabled` wire method that returns all `TimeSlot__c` records with parent `Course__c` fields
- `CourseCalendarControllerTest` — Apex test class covering the controller
- `courseCalendar` LWC — weekly grid calendar (Mon–Sun columns, 07:00–21:00 time axis) showing every course's time slots as coloured cards
- `force-app/test/jest-mocks/apex.js` — shared Jest mock for `@salesforce/apex` imports
- `jest.config.cjs` — renamed from `jest.config.js` for ESM/CJS compatibility; added `moduleNameMapper` for `@salesforce/apex` and excluded Playwright tests from Jest runs

The component targets `lightning__AppPage` and `lightning__HomePage` and can be added to any Lightning page via the App Builder.

## Deploy Steps

```bash
sf project deploy start --source-dir force-app
sf apex run test --class-names CourseCalendarControllerTest --synchronous
```

## Data Backfill

None required.

## Rollback

```bash
sf project delete source --metadata ApexClass:CourseCalendarController
sf project delete source --metadata ApexClass:CourseCalendarControllerTest
sf project delete source --metadata LightningComponentBundle:courseCalendar
```

Revert `jest.config.cjs` changes (restore filename to `jest.config.js` and remove the `moduleNameMapper` and `testPathIgnorePatterns` additions).
