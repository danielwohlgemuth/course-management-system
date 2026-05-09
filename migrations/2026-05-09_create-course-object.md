# Create Course__c Object

## What changed

New custom object `Course__c` with:
- `Name` (AutoNumber, format `CRS-{0000}`) — system-assigned unique identifier
- `Course_Name__c` (Text 255, required) — full course title, avoids the 80-char Name field limit
- `Instructor__c` (Text 255, optional) — name of the course instructor

## Deploy steps

```bash
sf project deploy start --source-dir force-app/main/default/objects/Course__c
```

## Data backfill

No existing records. No action required.

## Rollback

Delete all `Course__c` records first (the object must be empty), then delete the object via Setup > Object Manager > Course > Delete.
