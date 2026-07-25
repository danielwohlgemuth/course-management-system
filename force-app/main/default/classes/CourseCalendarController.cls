public with sharing class CourseCalendarController {
  @AuraEnabled(cacheable=true)
  public static List<TimeSlot__c> getTimeSlots(String semester) {
    if (String.isNotBlank(semester)) {
      return [
        SELECT
          Id,
          Day_of_Week__c,
          Start_Time__c,
          End_Time__c,
          Course__c,
          Course__r.Name,
          Course__r.Course_Name__c,
          Course__r.Instructor_User__r.Name,
          Course__r.Semester__c,
          Course__r.Classroom__c
        FROM TimeSlot__c
        WHERE Course__r.Semester__c = :semester
        WITH USER_MODE
        ORDER BY Day_of_Week__c, Start_Time__c
      ];
    }
    return [
      SELECT
        Id,
        Day_of_Week__c,
        Start_Time__c,
        End_Time__c,
        Course__c,
        Course__r.Name,
        Course__r.Course_Name__c,
        Course__r.Instructor_User__r.Name,
        Course__r.Semester__c,
        Course__r.Classroom__c
      FROM TimeSlot__c
      WITH USER_MODE
      ORDER BY Day_of_Week__c, Start_Time__c
    ];
  }

  @AuraEnabled(cacheable=true)
  public static List<TimeSlot__c> getTimeSlotsForCourse(Id courseId) {
    return [
      SELECT Id, Day_of_Week__c, Start_Time__c, End_Time__c
      FROM TimeSlot__c
      WHERE Course__c = :courseId
      WITH USER_MODE
      ORDER BY Day_of_Week__c, Start_Time__c
    ];
  }

  @AuraEnabled(cacheable=true)
  public static CourseCalendarConfig__mdt getConfig() {
    return [
      SELECT
        Grid_Start_Hour__c,
        Grid_End_Hour__c,
        Palette__c,
        Height_Pixels__c,
        Semester__c
      FROM CourseCalendarConfig__mdt
      WHERE DeveloperName = 'Default'
      LIMIT 1
    ];
  }
}
