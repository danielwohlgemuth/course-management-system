@IsTest
private class CoursePdfReportControllerTest {
  @TestSetup
  static void makeData() {
    Id userId = UserInfo.getUserId();
    insert new Course__c(
      Course_Name__c = 'Algebra',
      Instructor_User__c = userId,
      Semester__c = '2026 S1'
    );

    Profile standardProfile = [
      SELECT Id
      FROM Profile
      WHERE Name = 'Standard User'
      LIMIT 1
    ];
    List<User> students = new List<User>();
    for (Integer i = 0; i < 2; i++) {
      students.add(
        new User(
          FirstName = 'Test',
          LastName = 'Student' + i,
          Alias = 'tstu' + i,
          Email = 'test.student' + i + '@coursepdfreport.example.com.invalid',
          Username = 'test.student' + i + '@coursepdfreport.example.com',
          ProfileId = standardProfile.Id,
          TimeZoneSidKey = 'America/Los_Angeles',
          LocaleSidKey = 'en_US',
          EmailEncodingKey = 'UTF-8',
          LanguageLocaleKey = 'en_US'
        )
      );
    }
    insert students;
  }

  @IsTest
  static void constructorWithNoEnrollmentsTest() {
    Course__c course = [SELECT Id FROM Course__c LIMIT 1];
    ApexPages.StandardController stdController = new ApexPages.StandardController(
      course
    );

    Test.startTest();
    CoursePdfReportController controller = new CoursePdfReportController(
      stdController
    );
    Test.stopTest();

    Assert.areEqual(
      course.Id,
      controller.course.Id,
      'Expected the course to be loaded'
    );
    Assert.isTrue(controller.enrollments.isEmpty(), 'Expected no enrollments');
  }

  @IsTest
  static void constructorWithOneEnrollmentTest() {
    Course__c course = [SELECT Id FROM Course__c LIMIT 1];
    User student = [SELECT Id FROM User WHERE LastName = 'Student0' LIMIT 1];
    insert new Enrollment__c(Course__c = course.Id, Student__c = student.Id);
    ApexPages.StandardController stdController = new ApexPages.StandardController(
      course
    );

    Test.startTest();
    CoursePdfReportController controller = new CoursePdfReportController(
      stdController
    );
    Test.stopTest();

    Assert.areEqual(
      1,
      controller.enrollments.size(),
      'Expected one enrollment'
    );
  }

  @IsTest
  static void constructorWithManyEnrollmentsTest() {
    Course__c course = [SELECT Id FROM Course__c LIMIT 1];
    List<User> students = [SELECT Id FROM User WHERE LastName LIKE 'Student%'];

    List<Enrollment__c> enrollmentsToInsert = new List<Enrollment__c>{
      new Enrollment__c(
        Course__c = course.Id,
        Student__c = UserInfo.getUserId()
      )
    };
    for (User student : students) {
      enrollmentsToInsert.add(
        new Enrollment__c(Course__c = course.Id, Student__c = student.Id)
      );
    }
    insert enrollmentsToInsert;

    ApexPages.StandardController stdController = new ApexPages.StandardController(
      course
    );

    Test.startTest();
    CoursePdfReportController controller = new CoursePdfReportController(
      stdController
    );
    Test.stopTest();

    Assert.areEqual(
      enrollmentsToInsert.size(),
      controller.enrollments.size(),
      'Expected all enrollments to be returned'
    );
  }

  @IsTest
  static void getEnrollmentsWithNoEnrollmentsTest() {
    Course__c course = [SELECT Id FROM Course__c LIMIT 1];

    Test.startTest();
    List<Enrollment__c> enrollments = CoursePdfReportController.getEnrollments(
      course.Id
    );
    Test.stopTest();

    Assert.isTrue(enrollments.isEmpty(), 'Expected no enrollments');
  }

  @IsTest
  static void getEnrollmentsWithOneEnrollmentTest() {
    Course__c course = [SELECT Id FROM Course__c LIMIT 1];
    User student = [SELECT Id FROM User WHERE LastName = 'Student0' LIMIT 1];
    insert new Enrollment__c(Course__c = course.Id, Student__c = student.Id);

    Test.startTest();
    List<Enrollment__c> enrollments = CoursePdfReportController.getEnrollments(
      course.Id
    );
    Test.stopTest();

    Assert.areEqual(1, enrollments.size(), 'Expected one enrollment');
  }

  @IsTest
  static void getEnrollmentsWithManyEnrollmentsTest() {
    Course__c course = [SELECT Id FROM Course__c LIMIT 1];
    List<User> students = [SELECT Id FROM User WHERE LastName LIKE 'Student%'];

    List<Enrollment__c> enrollmentsToInsert = new List<Enrollment__c>{
      new Enrollment__c(
        Course__c = course.Id,
        Student__c = UserInfo.getUserId()
      )
    };
    for (User student : students) {
      enrollmentsToInsert.add(
        new Enrollment__c(Course__c = course.Id, Student__c = student.Id)
      );
    }
    insert enrollmentsToInsert;

    Test.startTest();
    List<Enrollment__c> enrollments = CoursePdfReportController.getEnrollments(
      course.Id
    );
    Test.stopTest();

    Assert.areEqual(
      enrollmentsToInsert.size(),
      enrollments.size(),
      'Expected all enrollments to be returned'
    );
  }
}
