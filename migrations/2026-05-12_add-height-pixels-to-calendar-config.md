# Add Height_Pixels__c to CourseCalendarConfig__mdt

## What changed

- Added `Height_Pixels__c` (Number, precision 4, scale 0) to `CourseCalendarConfig__mdt`
- Set the value to `840` in the `Default` record
- The `courseCalendar` LWC now reads this field instead of using a hardcoded CSS `height: 840px`

## Deploy steps

```bash
sf project deploy start --source-dir force-app/main/default/objects/CourseCalendarConfig__mdt/fields/Height_Pixels__c.field-meta.xml
sf project deploy start --source-dir force-app/main/default/customMetadata/CourseCalendarConfig.Default.md-meta.xml
sf project deploy start --source-dir force-app/main/default/layouts/CourseCalendarConfig__mdt-Course\ Calendar\ Config\ Layout.layout-meta.xml
sf project deploy start --source-dir force-app/main/default/classes/CourseCalendarController.cls
sf project deploy start --source-dir force-app/main/default/lwc/courseCalendar
```

Or deploy everything at once:

```bash
sf project deploy start --source-dir force-app
```

## Data backfill

The `Default` custom metadata record ships with `Height_Pixels__c = 840`, matching the previously hardcoded value. No additional backfill is needed.

## Rollback

1. Remove `Height_Pixels__c` from the SOQL query in `CourseCalendarController.cls` and revert the `_config` mapping in `courseCalendar.js`.
2. Restore `height: 840px` to `.calendar-body` in `courseCalendar.css` and remove the `style={calendarBodyStyle}` attribute from the template.
3. Delete the `Height_Pixels__c` field via Setup > Object Manager > CourseCalendarConfig__mdt > Fields.
