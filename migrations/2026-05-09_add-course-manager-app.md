# Add Course Manager App

## What changed

Added `CourseManager` Lightning app (`force-app/main/default/applications/CourseManager.app-meta.xml`). The app includes the Home tab and the `Course__c` tab, with Courses set as the default landing tab.

## Deploy steps

```bash
sf project deploy start --source-dir force-app/main/default/applications
```

## Data backfill

None required — this change adds a new app with no impact on existing records.

## Rollback

```bash
sf project delete source --metadata CustomApplication:CourseManager
```
