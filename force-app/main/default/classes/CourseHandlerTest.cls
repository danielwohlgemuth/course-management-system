@isTest
private class CourseHandlerTest {
  static User buildTestUser(String suffix) {
    Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
    return new User(
      FirstName = 'Test',
      LastName = 'Instructor' + suffix,
      Email = 'test.course.handler' + suffix + '@example.com',
      Username = 'test.course.handler' +
        suffix +
        '.' +
        UserInfo.getOrganizationId() +
        '@example.com',
      Alias = 'tchI' + suffix.left(3),
      ProfileId = p.Id,
      TimeZoneSidKey = 'America/Los_Angeles',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US'
    );
  }

  @isTest
  static void testInsertCreatesGroupAndShare() {
    Course__c course = new Course__c(
      Course_Name__c = 'Test Course',
      Instructor_User__c = UserInfo.getUserId()
    );

    Test.startTest();
    insert course;
    Test.stopTest();

    course = [
      SELECT Id, Public_Group_Id__c
      FROM Course__c
      WHERE Id = :course.Id
    ];
    System.assertNotEquals(
      null,
      course.Public_Group_Id__c,
      'Public_Group_Id__c should be set after insert'
    );

    List<Group> groups = [
      SELECT Id, Name, Type
      FROM Group
      WHERE Id = :course.Public_Group_Id__c
    ];
    System.assertEquals(1, groups.size(), 'One group should be created');
    System.assertEquals(
      'Test Course',
      groups[0].Name,
      'Group name should match course name'
    );
    System.assertEquals(
      'Regular',
      groups[0].Type,
      'Group type should be Regular'
    );

    List<Course__Share> groupShares = [
      SELECT Id, AccessLevel
      FROM Course__Share
      WHERE ParentId = :course.Id AND UserOrGroupId = :course.Public_Group_Id__c
    ];
    System.assertEquals(
      1,
      groupShares.size(),
      'One Course__Share should be created for the group'
    );
    System.assertEquals(
      'Read',
      groupShares[0].AccessLevel,
      'Group share should have Read access'
    );
  }

  @isTest
  static void testInsertCreatesInstructorShare() {
    User instructor = buildTestUser('A');
    System.runAs(new User(Id = UserInfo.getUserId())) {
      insert instructor;
    }

    Course__c course = new Course__c(
      Course_Name__c = 'Instructor Share Course',
      Instructor_User__c = instructor.Id
    );

    Test.startTest();
    insert course;
    Test.stopTest();

    List<Course__Share> instructorShares = [
      SELECT Id, AccessLevel
      FROM Course__Share
      WHERE
        ParentId = :course.Id
        AND UserOrGroupId = :instructor.Id
        AND RowCause = 'Manual'
    ];
    System.assertEquals(
      1,
      instructorShares.size(),
      'An instructor Course__Share should be created on insert'
    );
    System.assertEquals(
      'Edit',
      instructorShares[0].AccessLevel,
      'Instructor share should have Edit access'
    );
  }

  @isTest
  static void testInsertNoInstructorShareWhenInstructorIsOwner() {
    Course__c course = new Course__c(
      Course_Name__c = 'Owner Instructor Course',
      Instructor_User__c = UserInfo.getUserId()
    );

    Test.startTest();
    insert course;
    Test.stopTest();

    List<Course__Share> ownerShares = [
      SELECT Id
      FROM Course__Share
      WHERE
        ParentId = :course.Id
        AND UserOrGroupId = :UserInfo.getUserId()
        AND RowCause = 'Manual'
    ];
    System.assertEquals(
      0,
      ownerShares.size(),
      'No share should be created when instructor is the record owner'
    );
  }

  @isTest
  static void testUpdateChangesInstructorShare() {
    User instructorA = buildTestUser('B');
    User instructorB = buildTestUser('C');
    System.runAs(new User(Id = UserInfo.getUserId())) {
      insert new List<User>{ instructorA, instructorB };
    }

    Course__c course = new Course__c(
      Course_Name__c = 'Update Instructor Course',
      Instructor_User__c = instructorA.Id
    );
    insert course;

    Test.startTest();
    course.Instructor_User__c = instructorB.Id;
    update course;
    Test.stopTest();

    List<Course__Share> sharesForA = [
      SELECT Id
      FROM Course__Share
      WHERE
        ParentId = :course.Id
        AND UserOrGroupId = :instructorA.Id
        AND RowCause = 'Manual'
    ];
    System.assertEquals(
      0,
      sharesForA.size(),
      'Old instructor share should be removed after update'
    );

    List<Course__Share> sharesForB = [
      SELECT Id, AccessLevel
      FROM Course__Share
      WHERE
        ParentId = :course.Id
        AND UserOrGroupId = :instructorB.Id
        AND RowCause = 'Manual'
    ];
    System.assertEquals(
      1,
      sharesForB.size(),
      'New instructor share should be created after update'
    );
    System.assertEquals(
      'Edit',
      sharesForB[0].AccessLevel,
      'New instructor share should have Edit access'
    );
  }

  @isTest
  static void testDeleteRemovesGroup() {
    Course__c course = new Course__c(
      Course_Name__c = 'Delete Test Course',
      Instructor_User__c = UserInfo.getUserId()
    );
    insert course;

    course = [
      SELECT Id, Public_Group_Id__c
      FROM Course__c
      WHERE Id = :course.Id
    ];
    Id groupId = course.Public_Group_Id__c;
    System.assertNotEquals(null, groupId, 'Group should be created on insert');

    Test.startTest();
    delete course;
    Test.stopTest();

    List<Group> groups = [SELECT Id FROM Group WHERE Id = :groupId];
    System.assertEquals(
      0,
      groups.size(),
      'Group should be deleted with the course'
    );
  }

  @isTest
  static void testBulkInsert() {
    List<Course__c> courses = new List<Course__c>();
    for (Integer i = 0; i < 10; i++) {
      courses.add(
        new Course__c(
          Course_Name__c = 'Bulk Course ' + i,
          Instructor_User__c = UserInfo.getUserId()
        )
      );
    }

    Test.startTest();
    insert courses;
    Test.stopTest();

    List<Course__c> inserted = [
      SELECT Id, Public_Group_Id__c
      FROM Course__c
      WHERE Id IN :courses
    ];
    System.assertEquals(
      10,
      inserted.size(),
      'All 10 courses should be present'
    );
    for (Course__c c : inserted) {
      System.assertNotEquals(
        null,
        c.Public_Group_Id__c,
        'Every course should have a Public_Group_Id__c'
      );
    }

    // Instructor == owner in this test, so only the group shares are created (one per course)
    List<Course__Share> shares = [
      SELECT Id
      FROM Course__Share
      WHERE ParentId IN :courses AND RowCause = 'Manual'
    ];
    System.assertEquals(
      10,
      shares.size(),
      'Each course should have one manual Course__Share for its group'
    );
  }

  @isTest
  static void testDeleteWithNullGroupIdIsNoOp() {
    Course__c course = new Course__c(
      Course_Name__c = 'Null Group Course',
      Instructor_User__c = UserInfo.getUserId()
    );
    insert course;

    Course__c stub = new Course__c(Id = course.Id, Public_Group_Id__c = null);

    Test.startTest();
    CourseHandler.onBeforeDelete(new List<Course__c>{ stub });
    Test.stopTest();

    System.assert(true, 'No exception should be thrown for null group ID');
  }
}
