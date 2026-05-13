public with sharing class CourseCalendarController {
    @AuraEnabled(cacheable=true)
    public static List<TimeSlot__c> getTimeSlots() {
        return [
            SELECT Id, Day_of_Week__c, Start_Time__c, End_Time__c,
                   Course__c, Course__r.Name, Course__r.Course_Name__c, Course__r.Instructor__c
            FROM TimeSlot__c
            WITH USER_MODE
            ORDER BY Day_of_Week__c, Start_Time__c
        ];
    }
}