List<Course__c> courses = [SELECT Id, Semester__c FROM Course__c WHERE Semester__c != null];
for (Course__c c : courses) { c.Semester__c = null; }
update courses;
System.debug('Cleared Semester__c on ' + courses.size() + ' records.');
