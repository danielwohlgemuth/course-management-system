// Deletes all TimeSlot__c and Course__c records.
// Run via: SFDX: Execute Anonymous Apex with Editor Contents

List<TimeSlot__c> slots = [SELECT Id FROM TimeSlot__c LIMIT 10000];
delete slots;
System.debug('Deleted ' + slots.size() + ' TimeSlot__c records');

List<Course__c> courses = [SELECT Id FROM Course__c LIMIT 10000];
delete courses;
System.debug('Deleted ' + courses.size() + ' Course__c records');
