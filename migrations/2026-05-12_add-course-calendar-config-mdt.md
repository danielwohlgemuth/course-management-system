# Add CourseCalendarConfig__mdt Custom Metadata Type

## What changed

- New Custom Metadata Type `CourseCalendarConfig__mdt` with three fields:
  - `Grid_Start_Hour__c` (Number) — first hour shown on the calendar grid
  - `Grid_End_Hour__c` (Number) — last hour shown on the calendar grid
  - `Palette__c` (LongTextArea) — comma-separated hex colour codes assigned to courses
- Default record `CourseCalendarConfig.Default` seeded with the previous hardcoded values
- `CourseCalendarController` gains a new `getConfig()` Apex method
- `courseCalendar` LWC now wires `getConfig()` instead of using hardcoded constants

## Deploy steps

```bash
sf project deploy start --source-dir force-app/main/default/objects/CourseCalendarConfig__mdt
sf project deploy start --source-dir force-app/main/default/customMetadata/CourseCalendarConfig.Default.md-meta.xml
sf project deploy start --source-dir force-app/main/default/classes/CourseCalendarController.cls \
                                     force-app/main/default/classes/CourseCalendarControllerTest.cls \
                                     force-app/main/default/lwc/courseCalendar
```

Or deploy everything at once:

```bash
sf project deploy start --source-dir force-app
```

## Data backfill

None required. The `Default` record is included in the deployment and contains the same values that were previously hardcoded in the LWC.

## Rollback

1. Redeploy the previous version of `courseCalendar.js` (restoring the hardcoded constants).
2. Redeploy the previous version of `CourseCalendarController.cls` (removing `getConfig()`).
3. Delete the custom metadata type via Setup > Custom Metadata Types, or run:

```bash
sf project deploy start --manifest <manifest-without-CourseCalendarConfig__mdt>
```
