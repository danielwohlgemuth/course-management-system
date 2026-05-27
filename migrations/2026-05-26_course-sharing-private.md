# Change Course__c Sharing Model to Private

**Date:** 2026-05-26

## What changed

`Course__c.object-meta.xml` — `<sharingModel>` changed from `ReadWrite` to `Private`.

With `Private`, records are visible only to the owner and users with explicit sharing grants. This is the foundation for the experience site access model where students see only courses they are enrolled in.

## Deploy steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/objects/Course__c/Course__c.object-meta.xml \
  --ignore-conflicts
```

## Data backfill

No data backfill required. Existing record owners retain read/edit access to their own records automatically via Salesforce's owner-based implicit sharing.

## Rollback

Revert `<sharingModel>` back to `ReadWrite` in `Course__c.object-meta.xml` and redeploy:

```bash
sf project deploy start \
  --source-dir force-app/main/default/objects/Course__c/Course__c.object-meta.xml \
  --ignore-conflicts
```
