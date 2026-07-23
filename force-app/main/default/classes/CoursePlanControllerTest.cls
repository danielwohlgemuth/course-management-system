@isTest
private class CoursePlanControllerTest {
  static final String TEST_CLASSROOM = 'Room 101';

  static User buildTestUser(String suffix) {
    Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
    return new User(
      FirstName = 'Test',
      LastName = 'Planner' + suffix,
      Email = 'test.course.plan' + suffix + '@example.com',
      Username = 'test.course.plan' +
        suffix +
        '.' +
        UserInfo.getOrganizationId() +
        '@example.com',
      Alias = 'tcp' + suffix.left(4),
      ProfileId = p.Id,
      TimeZoneSidKey = 'America/Los_Angeles',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US'
    );
  }

  static User buildInstructor(String suffix) {
    User instructor = buildTestUser(suffix);
    System.runAs(new User(Id = UserInfo.getUserId())) {
      insert instructor;
      PermissionSet ps = [
        SELECT Id
        FROM PermissionSet
        WHERE Name = 'CourseInstructor'
        LIMIT 1
      ];
      insert new PermissionSetAssignment(
        AssigneeId = instructor.Id,
        PermissionSetId = ps.Id
      );
    }
    return instructor;
  }

  static CoursePlan__c makePlan(String name, Integer classesPerWeek) {
    return new CoursePlan__c(
      Course_Name__c = name,
      Classroom__c = TEST_CLASSROOM,
      Semester__c = '2026 S1',
      Classes_Per_Week__c = classesPerWeek,
      Class_Duration_Minutes__c = 60
    );
  }

  static Availability__c makeWindow(
    Id planId,
    String day,
    Integer startHour,
    Integer endHour
  ) {
    return new Availability__c(
      Course_Plan__c = planId,
      Day_of_Week__c = day,
      Start_Time__c = Time.newInstance(startHour, 0, 0, 0),
      End_Time__c = Time.newInstance(endHour, 0, 0, 0)
    );
  }

  @isTest
  static void lockPlanSuccessTest() {
    CoursePlan__c plan = makePlan('Biology 201', 2);
    insert plan;
    insert new List<Availability__c>{
      makeWindow(plan.Id, 'Monday', 9, 10),
      makeWindow(plan.Id, 'Wednesday', 9, 10)
    };

    Test.startTest();
    CoursePlanController.LockResult result = CoursePlanController.lockPlan(
      plan.Id
    );
    Test.stopTest();

    Assert.isTrue(
      result.scheduled,
      'Two windows fitting two classes should schedule: ' + result.errorMessage
    );
    Assert.isNull(result.errorMessage, 'No error message expected on success');
    Assert.isNotNull(result.courseId, 'A course should be generated');

    Course__c course = [
      SELECT
        Course_Name__c,
        Classroom__c,
        Semester__c,
        Instructor_User__c,
        Public_Group_Id__c
      FROM Course__c
      WHERE Id = :result.courseId
    ];
    Assert.areEqual(
      'Biology 201',
      course.Course_Name__c,
      'Course name should copy from the plan'
    );
    Assert.areEqual(
      TEST_CLASSROOM,
      course.Classroom__c,
      'Classroom should copy from the plan'
    );
    Assert.areEqual(
      '2026 S1',
      course.Semester__c,
      'Semester should copy from the plan'
    );
    Assert.areEqual(
      UserInfo.getUserId(),
      course.Instructor_User__c,
      'Instructor should be the plan owner'
    );
    Assert.isNotNull(
      course.Public_Group_Id__c,
      'CourseHandler should have created the public group'
    );

    Assert.areEqual(
      2,
      [SELECT COUNT() FROM TimeSlot__c WHERE Course__c = :course.Id],
      'One time slot per weekly class should be generated'
    );

    plan = [
      SELECT Status__c, Generated_Course__c, Scheduling_Error__c
      FROM CoursePlan__c
      WHERE Id = :plan.Id
    ];
    Assert.areEqual(
      CoursePlanLockService.STATUS_LOCKED,
      plan.Status__c,
      'Plan should be locked'
    );
    Assert.areEqual(
      course.Id,
      plan.Generated_Course__c,
      'Plan should link the generated course'
    );
    Assert.isNull(
      plan.Scheduling_Error__c,
      'No scheduling error expected on success'
    );
  }

  @isTest
  static void lockPlanInfeasibleTest() {
    CoursePlan__c plan = makePlan('Impossible Course', 3);
    insert plan;

    Test.startTest();
    CoursePlanController.LockResult result = CoursePlanController.lockPlan(
      plan.Id
    );
    Test.stopTest();

    Assert.isFalse(result.scheduled, 'A plan with no windows cannot schedule');
    Assert.areEqual(
      CoursePlanScheduler.ERROR_NO_AVAILABILITY_WINDOWS,
      result.errorMessage,
      'Error should explain the failure'
    );
    Assert.isNull(result.courseId, 'No course should be generated on failure');

    plan = [
      SELECT Status__c, Generated_Course__c, Scheduling_Error__c
      FROM CoursePlan__c
      WHERE Id = :plan.Id
    ];
    Assert.areEqual(
      CoursePlanLockService.STATUS_LOCKED,
      plan.Status__c,
      'Failed scheduling still locks the plan'
    );
    Assert.isNull(plan.Generated_Course__c, 'No generated course on failure');
    Assert.isNotNull(
      plan.Scheduling_Error__c,
      'The error should be stored on the plan'
    );
    Assert.areEqual(
      0,
      [
        SELECT COUNT()
        FROM Course__c
        WHERE Course_Name__c = 'Impossible Course'
      ],
      'No course record should exist'
    );
  }

  @isTest
  static void lockPlanAlreadyLockedTest() {
    CoursePlan__c plan = makePlan('Double Lock', 1);
    insert plan;
    insert makeWindow(plan.Id, 'Monday', 9, 10);
    CoursePlanLockService.lock(plan.Id);

    try {
      CoursePlanController.lockPlan(plan.Id);
      Assert.fail('Locking an already-locked plan should throw');
    } catch (AuraHandledException e) {
      Assert.areEqual(
        CoursePlanLockService.ERROR_ALREADY_LOCKED,
        e.getMessage(),
        'Expected the already-locked message'
      );
    }
  }

  @isTest
  static void unlockPlanDeletesGeneratedCourseTest() {
    User student = buildTestUser('ST');
    System.runAs(new User(Id = UserInfo.getUserId())) {
      insert student;
    }

    CoursePlan__c plan = makePlan('Unlock Course', 1);
    insert plan;
    insert makeWindow(plan.Id, 'Monday', 9, 10);

    Test.startTest();
    CoursePlanController.LockResult result = CoursePlanController.lockPlan(
      plan.Id
    );
    insert new Enrollment__c(
      Course__c = result.courseId,
      Student__c = student.Id
    );
    Id groupId = [
      SELECT Public_Group_Id__c
      FROM Course__c
      WHERE Id = :result.courseId
    ]
    .Public_Group_Id__c;

    CoursePlanController.unlockPlan(plan.Id);
    Test.stopTest();

    Assert.areEqual(
      0,
      [SELECT COUNT() FROM Course__c WHERE Id = :result.courseId],
      'Generated course should be deleted'
    );
    Assert.areEqual(
      0,
      [SELECT COUNT() FROM TimeSlot__c WHERE Course__c = :result.courseId],
      'Time slots should cascade-delete'
    );
    Assert.areEqual(
      0,
      [SELECT COUNT() FROM Enrollment__c WHERE Course__c = :result.courseId],
      'Enrollments should cascade-delete'
    );
    Assert.areEqual(
      0,
      [SELECT COUNT() FROM Group WHERE Id = :groupId],
      'The course public group should be cleaned up'
    );

    plan = [
      SELECT Status__c, Generated_Course__c, Scheduling_Error__c
      FROM CoursePlan__c
      WHERE Id = :plan.Id
    ];
    Assert.areEqual(
      CoursePlanLockService.STATUS_DRAFT,
      plan.Status__c,
      'Plan should be back in Draft'
    );
    Assert.isNull(
      plan.Generated_Course__c,
      'Generated course link should be cleared'
    );
    Assert.isNull(
      plan.Scheduling_Error__c,
      'Scheduling error should be cleared'
    );
    Assert.areEqual(
      1,
      [SELECT COUNT() FROM Availability__c WHERE Course_Plan__c = :plan.Id],
      'Availability windows should survive unlock so the plan can be adjusted and re-locked'
    );
  }

  @isTest
  static void unlockPlanNotLockedTest() {
    CoursePlan__c plan = makePlan('Never Locked', 1);
    insert plan;

    try {
      CoursePlanController.unlockPlan(plan.Id);
      Assert.fail('Unlocking a draft plan should throw');
    } catch (AuraHandledException e) {
      Assert.areEqual(
        CoursePlanLockService.ERROR_NOT_LOCKED,
        e.getMessage(),
        'Expected the not-locked message'
      );
    }
  }

  @isTest
  static void getPlanDetailsTest() {
    User student = buildTestUser('GD');
    System.runAs(new User(Id = UserInfo.getUserId())) {
      insert student;
    }

    CoursePlan__c plan = makePlan('Details Course', 2);
    insert plan;
    insert new List<Availability__c>{
      makeWindow(plan.Id, 'Wednesday', 9, 10),
      makeWindow(plan.Id, 'Monday', 14, 15)
    };

    Test.startTest();
    CoursePlanController.LockResult result = CoursePlanController.lockPlan(
      plan.Id
    );
    insert new Enrollment__c(
      Course__c = result.courseId,
      Student__c = student.Id
    );
    CoursePlanController.PlanDetails details = CoursePlanController.getPlanDetails(
      plan.Id
    );
    Test.stopTest();

    Assert.areEqual(
      2,
      details.sessions.size(),
      'Both generated sessions should be returned'
    );
    Assert.areEqual(
      'Monday',
      details.sessions[0].Day_of_Week__c,
      'Sessions should be ordered by weekday'
    );
    Assert.areEqual(
      'Wednesday',
      details.sessions[1].Day_of_Week__c,
      'Sessions should be ordered by weekday'
    );
    Assert.areEqual(
      1,
      details.enrollmentCount,
      'The enrollment count should be included'
    );
  }

  @isTest
  static void getPlanDetailsUnscheduledPlanTest() {
    CoursePlan__c plan = makePlan('Bare Plan', 1);
    insert plan;

    CoursePlanController.PlanDetails details = CoursePlanController.getPlanDetails(
      plan.Id
    );

    Assert.areEqual(
      0,
      details.sessions.size(),
      'A plan without a generated course has no sessions'
    );
    Assert.areEqual(
      0,
      details.enrollmentCount,
      'A plan without a generated course has no enrollments'
    );
  }

  @isTest
  static void instructorCanLockOwnPlanButNotEditCourseTest() {
    User instructor = buildInstructor('IN');

    System.runAs(instructor) {
      CoursePlan__c plan = makePlan('Instructor Plan', 1);
      insert plan;
      insert makeWindow(plan.Id, 'Monday', 9, 10);

      Test.startTest();
      CoursePlanController.LockResult result = CoursePlanController.lockPlan(
        plan.Id
      );
      Test.stopTest();

      Assert.isTrue(
        result.scheduled,
        'Instructor should be able to lock their own plan: ' +
        result.errorMessage
      );
      Course__c course = [
        SELECT Id, Course_Name__c, Instructor_User__c
        FROM Course__c
        WHERE Id = :result.courseId
      ];
      Assert.areEqual(
        instructor.Id,
        course.Instructor_User__c,
        'Generated course instructor should be the locking instructor'
      );

      // Direct modification must fail: the permission set no longer grants
      // create/edit/delete on Course__c or TimeSlot__c. Plain test DML skips
      // CRUD checks, so these assertions must run in user mode.
      course.Course_Name__c = 'Edited Directly';
      Database.SaveResult updateResult = Database.update(
        course,
        false,
        AccessLevel.USER_MODE
      );
      Assert.isFalse(
        updateResult.isSuccess(),
        'Instructor must not be able to edit a course directly'
      );

      Database.SaveResult insertResult = Database.insert(
        new TimeSlot__c(
          Course__c = course.Id,
          Day_of_Week__c = 'Friday',
          Start_Time__c = Time.newInstance(9, 0, 0, 0),
          End_Time__c = Time.newInstance(10, 0, 0, 0)
        ),
        false,
        AccessLevel.USER_MODE
      );
      Assert.isFalse(
        insertResult.isSuccess(),
        'Instructor must not be able to create a time slot directly'
      );
    }
  }

  @isTest
  static void nonOwnerCannotLockPlanTest() {
    User owner = buildInstructor('OW');
    User intruder = buildInstructor('NX');

    CoursePlan__c plan;
    System.runAs(owner) {
      plan = makePlan('Private Plan', 1);
      insert plan;
    }

    System.runAs(intruder) {
      try {
        CoursePlanController.lockPlan(plan.Id);
        Assert.fail('A non-owner must not be able to lock the plan');
      } catch (AuraHandledException e) {
        Assert.areEqual(
          CoursePlanController.ERROR_NO_ACCESS,
          e.getMessage(),
          'Expected the access-denied message'
        );
      }
    }
  }
}
