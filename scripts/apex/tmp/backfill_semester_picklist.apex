List<Course__c> coursesToUpdate = [SELECT Id FROM Course__c WHERE Semester__c = null];
for (Course__c c : coursesToUpdate) { c.Semester__c = '2026 S1'; }
update coursesToUpdate;
System.debug('Backfilled ' + coursesToUpdate.size());

for (Course__c c : [SELECT Name, Semester__c, Is_Current_Semester__c FROM Course__c]) {
    System.debug('COURSE: ' + c.Name + ' semester=' + c.Semester__c + ' isCurrent=' + c.Is_Current_Semester__c);
}
