Course__c c = [SELECT Id FROM Course__c WHERE Id = 'a00RK00000k5aMvYAI' LIMIT 1];
c.Classroom__c = 'Room 101';
update c;
System.debug('Updated Classroom__c on ' + c.Id);
