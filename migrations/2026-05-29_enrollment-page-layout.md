# Enrollment__c Page Layout

## What changed

Added a page layout for the `Enrollment__c` object (`Enrollment__c-Enrollment Layout.layout-meta.xml`). Without this layout Salesforce fell back to a system default that omitted the `Student__c` and `Course__c` fields, making it impossible to set the student when creating an enrollment from the Course related list.

## Deploy steps

```bash
sf project deploy start \
  --source-dir "force-app/main/default/layouts/Enrollment__c-Enrollment Layout.layout-meta.xml" \
  --ignore-conflicts
```

## Data backfill

None required. Existing enrollment records are unaffected.

## Rollback

Delete the layout file and redeploy, or remove it via Setup → Object Manager → Enrollment → Page Layouts.
