# 2026-06-01 Admin Permission Set

## What changed

- Added `CourseAdmin` permission set: full CRUD + View All + Modify All on `Course__c`, `TimeSlot__c`, and `Enrollment__c`; read/edit on all their custom fields; `CourseManager` app visibility; `Course__c` tab visible.
- Removed `CourseManagerAccess` permission set (superseded by `CourseAdmin`).

## Deploy steps

Run in order — migrate users **before** removing `CourseManagerAccess` to avoid an access gap.

### 1. Deploy `CourseAdmin`

```bash
sf project deploy start \
  --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml
```

### 2. Reassign users from `CourseManagerAccess` to `CourseAdmin`

Execute the following as Anonymous Apex in the target org (Developer Console → Execute Anonymous, or `sf apex run`):

```apex
PermissionSet oldPs = [SELECT Id FROM PermissionSet WHERE Name = 'CourseManagerAccess' LIMIT 1];
PermissionSet newPs = [SELECT Id FROM PermissionSet WHERE Name = 'CourseAdmin' LIMIT 1];

List<PermissionSetAssignment> oldAssignments =
    [SELECT AssigneeId FROM PermissionSetAssignment WHERE PermissionSetId = :oldPs.Id];

List<PermissionSetAssignment> toInsert = new List<PermissionSetAssignment>();
for (PermissionSetAssignment psa : oldAssignments) {
    toInsert.add(new PermissionSetAssignment(
        AssigneeId = psa.AssigneeId,
        PermissionSetId = newPs.Id
    ));
}
insert toInsert;

delete oldAssignments;
```

### 3. Remove `CourseManagerAccess` from the org

```bash
sf project deploy start \
  --metadata "PermissionSet:CourseManagerAccess" \
  --post-destructive-changes <(echo '<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
  <version>62.0</version>
</Package>') 2>/dev/null || \
sf org delete source \
  --metadata "PermissionSet:CourseManagerAccess"
```

Alternatively, delete it via Setup → Permission Sets in the org UI, then confirm the local file has already been removed from the repo.

## Data backfill

No field-level data backfill needed — this change only adds/removes permission set records.

## Rollback

1. Redeploy `CourseManagerAccess` from git history.
2. Run the Anonymous Apex above in reverse (swap `oldPs`/`newPs` variable names).
3. Delete the `CourseAdmin` permission set from the org via Setup → Permission Sets.
