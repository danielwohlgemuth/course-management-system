# 2026-06-11 — Backfill enrollment group members

## What changed

No schema change. The `EnrollmentHandler` trigger (added 2026-06-01) keeps `GroupMember` records in sync for new enrollments, but students enrolled before that trigger existed are missing from their course's public group. This migration also upgrades existing student users from the Customer Community (High Volume / CspLitePortal) profile to **Customer Community Plus**, which is required for group membership.

## Deploy steps

No metadata to deploy.

## Data backfill

### 1. Upgrade student profiles to Customer Community Plus

```apex
Id ccpProfileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User' LIMIT 1].Id;
List<User> students = [SELECT Id, ProfileId FROM User WHERE Name IN ('Alice Chen', 'Ben Torres', 'Chloe Kim') AND IsActive = true];
for (User u : students) { u.ProfileId = ccpProfileId; }
update students;
System.debug('Upgraded ' + students.size() + ' students to Customer Community Plus');
```

### 2. Backfill GroupMember records

```bash
sf apex run --file scripts/apex/backfill_enrollment_group_members.apex
```

The script is idempotent — skips any student already in the group and can be re-run safely.

## Rollback

Remove the `GroupMember` records added by the backfill:

```apex
Set<Id> groupIds = new Set<Id>();
for (Course__c c : [SELECT Public_Group_Id__c FROM Course__c WHERE Public_Group_Id__c != null]) {
    groupIds.add(c.Public_Group_Id__c);
}
Set<Id> studentIds = new Set<Id>();
for (User u : [SELECT Id FROM User WHERE Name IN ('Alice Chen', 'Ben Torres', 'Chloe Kim')]) {
    studentIds.add(u.Id);
}
delete [SELECT Id FROM GroupMember WHERE GroupId IN :groupIds AND UserOrGroupId IN :studentIds];
```
