// Backfill: add enrolled students to their course's public group.
// Requires students to be on Customer Community Plus (not High Volume/CspLitePortal),
// which supports GroupMember. Safe to re-run — skips pairs already in GroupMember.

Map<Id, Id> courseToGroup = new Map<Id, Id>();
for (Course__c c : [SELECT Id, Public_Group_Id__c FROM Course__c WHERE Public_Group_Id__c != null]) {
    courseToGroup.put(c.Id, c.Public_Group_Id__c);
}

if (courseToGroup.isEmpty()) {
    System.debug('No courses with a Public_Group_Id__c found — nothing to backfill.');
    return;
}

List<Enrollment__c> enrollments = [
    SELECT Course__c, Student__c
    FROM Enrollment__c
    WHERE Course__c IN :courseToGroup.keySet()
    AND Student__c != null
];

Set<Id> groupIdSet = new Set<Id>(courseToGroup.values());
Set<String> existing = new Set<String>();
for (GroupMember gm : [
    SELECT GroupId, UserOrGroupId
    FROM GroupMember
    WHERE GroupId IN :groupIdSet
]) {
    existing.add(gm.GroupId + '_' + gm.UserOrGroupId);
}

List<GroupMember> toInsert = new List<GroupMember>();
for (Enrollment__c e : enrollments) {
    Id groupId = courseToGroup.get(e.Course__c);
    if (groupId == null) continue;
    String key = groupId + '_' + e.Student__c;
    if (!existing.contains(key)) {
        toInsert.add(new GroupMember(GroupId = groupId, UserOrGroupId = e.Student__c));
        existing.add(key);
    }
}

if (toInsert.isEmpty()) {
    System.debug('All enrolled students are already group members — nothing to insert.');
} else {
    insert toInsert;
    System.debug('Inserted ' + toInsert.size() + ' GroupMember record(s).');
}
