public with sharing class CoursePdfReportController {
  public Course__c course { get; private set; }
  public List<Enrollment__c> enrollments { get; private set; }

  public CoursePdfReportController(ApexPages.StandardController stdController) {
    Id courseId = stdController.getId();

    course = [
      SELECT Id, Name, Course_Name__c, Semester__c, Classroom__c
      FROM Course__c
      WHERE Id = :courseId
      WITH USER_MODE
    ];

    enrollments = [
      SELECT Id, Student__r.Name
      FROM Enrollment__c
      WHERE Course__c = :courseId
      WITH USER_MODE
      ORDER BY Student__r.Name
    ];
  }

  @AuraEnabled(cacheable=true)
  public static List<Enrollment__c> getEnrollments(Id courseId) {
    return [
      SELECT Id, Student__r.Name
      FROM Enrollment__c
      WHERE Course__c = :courseId
      WITH USER_MODE
      ORDER BY Student__r.Name
    ];
  }
}
