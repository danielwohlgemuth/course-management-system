@isTest
private class CoursePlanHandlerTest {
  static final String TEST_CLASSROOM = 'Room 101';

  static User buildTestUser(String suffix) {
    Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
    return new User(
      FirstName = 'Test',
      LastName = 'Student' + suffix,
      Email = 'test.course.plan.handler' + suffix + '@example.com',
      Username = 'test.course.plan.handler' +
        suffix +
        '.' +
        UserInfo.getOrganizationId() +
        '@example.com',
      Alias = 'tcph' + suffix.left(4),
      ProfileId = p.Id,
      TimeZoneSidKey = 'America/Los_Angeles',
      LocaleSidKey = 'en_US',
      EmailEncodingKey = 'UTF-8',
      LanguageLocaleKey = 'en_US'
    );
  }

  static CoursePlan__c makeDraftPlan(String name) {
    return new CoursePlan__c(
      Course_Name__c = name,
      Classroom__c = TEST_CLASSROOM,
      Semester__c = '2026 S1',
      Classes_Per_Week__c = 1,
      Class_Duration_Minutes__c = 60
    );
  }

  static CoursePlan__c makeLockedPlan(String name) {
    CoursePlan__c plan = makeDraftPlan(name);
    insert plan;
    insert new Availability__c(
      Course_Plan__c = plan.Id,
      Day_of_Week__c = 'Monday',
      Start_Time__c = Time.newInstance(9, 0, 0, 0),
      End_Time__c = Time.newInstance(10, 0, 0, 0)
    );
    CoursePlanLockService.lock(plan.Id);
    return plan;
  }

  @isTest
  static void onBeforeUpdateLockedPlanEditBlockedTest() {
    CoursePlan__c plan = makeLockedPlan('Locked Edit Plan');
    plan.Course_Name__c = 'Renamed';

    try {
      update plan;
      Assert.fail('Editing a locked plan should be blocked');
    } catch (DmlException e) {
      Assert.isTrue(
        e.getDmlMessage(0).contains(CoursePlanHandler.ERROR_EDIT_LOCKED_PLAN),
        'Error should say the plan is locked: ' + e.getDmlMessage(0)
      );
    }
  }

  @isTest
  static void onBeforeUpdateManualLockBlockedTest() {
    CoursePlan__c plan = makeDraftPlan('Manual Lock Plan');
    insert plan;
    plan.Status__c = CoursePlanLockService.STATUS_LOCKED;

    try {
      update plan;
      Assert.fail(
        'Flipping Status to Locked outside the action should be blocked'
      );
    } catch (DmlException e) {
      Assert.isTrue(
        e.getDmlMessage(0).contains(CoursePlanHandler.ERROR_MANUAL_LOCK),
        'Error should point to the Lock Plan action: ' + e.getDmlMessage(0)
      );
    }
  }

  @isTest
  static void onBeforeUpdateManualUnlockBlockedTest() {
    CoursePlan__c plan = makeLockedPlan('Manual Unlock Plan');
    plan.Status__c = CoursePlanLockService.STATUS_DRAFT;

    try {
      update plan;
      Assert.fail(
        'Flipping Status back to Draft outside the action should be blocked'
      );
    } catch (DmlException e) {
      Assert.isTrue(
        e.getDmlMessage(0).contains(CoursePlanHandler.ERROR_EDIT_LOCKED_PLAN),
        'Error should point to the Unlock action: ' + e.getDmlMessage(0)
      );
    }
  }

  @isTest
  static void onBeforeUpdateSystemFieldsBlockedTest() {
    CoursePlan__c plan = makeDraftPlan('System Fields Plan');
    insert plan;
    plan.Scheduling_Error__c = 'hand-written error';

    try {
      update plan;
      Assert.fail(
        'Editing system-managed fields on a draft plan should be blocked'
      );
    } catch (DmlException e) {
      Assert.isTrue(
        e.getDmlMessage(0)
          .contains(CoursePlanHandler.ERROR_SYSTEM_FIELDS_MANAGED),
        'Error should say the fields are system-managed: ' + e.getDmlMessage(0)
      );
    }
  }

  @isTest
  static void onBeforeDeleteLockedPlanKeepsGeneratedCourseTest() {
    User student = buildTestUser('DP');
    System.runAs(new User(Id = UserInfo.getUserId())) {
      insert student;
    }

    CoursePlan__c plan = makeLockedPlan('Locked Delete Plan');
    plan = [
      SELECT Generated_Course__c
      FROM CoursePlan__c
      WHERE Id = :plan.Id
    ];
    Id courseId = plan.Generated_Course__c;
    insert new Enrollment__c(Course__c = courseId, Student__c = student.Id);

    Test.startTest();
    delete plan;
    Test.stopTest();

    Assert.areEqual(
      1,
      [SELECT COUNT() FROM Course__c WHERE Id = :courseId],
      'Generated course should survive deleting the locked plan'
    );
    Assert.areEqual(
      1,
      [SELECT COUNT() FROM TimeSlot__c WHERE Course__c = :courseId],
      'Course time slots should survive deleting the locked plan'
    );
    Assert.areEqual(
      1,
      [SELECT COUNT() FROM Enrollment__c WHERE Course__c = :courseId],
      'Course enrollments should survive deleting the locked plan'
    );
  }

  @isTest
  static void onBeforeDeleteDraftPlanCascadesAvailabilityTest() {
    CoursePlan__c plan = makeDraftPlan('Draft Delete Plan');
    insert plan;
    insert new Availability__c(
      Course_Plan__c = plan.Id,
      Day_of_Week__c = 'Tuesday',
      Start_Time__c = Time.newInstance(9, 0, 0, 0),
      End_Time__c = Time.newInstance(10, 0, 0, 0)
    );

    Test.startTest();
    delete plan;
    Test.stopTest();

    Assert.areEqual(
      0,
      [SELECT COUNT() FROM Availability__c],
      'Availability windows should cascade-delete with the draft plan'
    );
  }

  @isTest
  static void onBeforeUpdateBulkMixTest() {
    List<CoursePlan__c> drafts = new List<CoursePlan__c>();
    for (Integer i = 0; i < 3; i++) {
      drafts.add(makeDraftPlan('Bulk Draft ' + i));
    }
    insert drafts;
    CoursePlan__c locked = makeLockedPlan('Bulk Locked');

    List<CoursePlan__c> updates = new List<CoursePlan__c>();
    for (CoursePlan__c draft : drafts) {
      updates.add(
        new CoursePlan__c(
          Id = draft.Id,
          Course_Name__c = draft.Course_Name__c + ' v2'
        )
      );
    }
    updates.add(
      new CoursePlan__c(Id = locked.Id, Course_Name__c = 'Bulk Locked v2')
    );

    Test.startTest();
    List<Database.SaveResult> results = Database.update(updates, false);
    Test.stopTest();

    for (Integer i = 0; i < 3; i++) {
      Assert.isTrue(
        results[i].isSuccess(),
        'Draft plan ' + i + ' should update in a mixed batch'
      );
    }
    Assert.isFalse(
      results[3].isSuccess(),
      'Locked plan should be rejected in a mixed batch'
    );
  }
}
