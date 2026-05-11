# Add Course Lightning Record Page

## What changed

Added `force-app/main/default/flexipages/Course_Record_Page.flexipage-meta.xml` — a Lightning Record Page for `Course__c` with a highlights panel, full record detail view, and related lists quick links. Intended as the default record page for the Course Manager app.

## Deploy steps

```bash
# Deploy the FlexiPage
sf project deploy start --source-dir force-app/main/default/flexipages/Course_Record_Page.flexipage-meta.xml
```

## Set as app default

Page activation is managed through Lightning App Builder and cannot be set via a CLI command alone. After deploying:

1. Open the org: `sf org open`
2. Navigate to **Setup → Lightning App Builder**.
3. Open **Course Record Page**.
4. Click **Activation…** in the top-right toolbar.
5. On the **App Default** tab, click **Assign as App Default**.
6. Select **Course Manager** from the app list and click **Next → Save**.

## Data backfill

None required — this change adds UI metadata only.

## Rollback

```bash
# Remove the FlexiPage from the org
sf project deploy start --metadata "FlexiPage:Course_Record_Page" --purge-on-delete
```

To restore the standard record layout after rollback, go to **Setup → Lightning App Builder**, find any Course page, and remove the Course Manager app assignment.
