@isTest
private class CoursePlanHandlerTest {
  static final String TEST_CLASSROOM = 'Room 101';

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
  static void onBeforeDeleteLockedPlanBlockedTest() {
    CoursePlan__c plan = makeLockedPlan('Locked Delete Plan');

    try {
      delete plan;
      Assert.fail('Deleting a locked plan should be blocked');
    } catch (DmlException e) {
      Assert.isTrue(
        e.getDmlMessage(0).contains(CoursePlanHandler.ERROR_DELETE_LOCKED_PLAN),
        'Error should require unlocking first: ' + e.getDmlMessage(0)
      );
    }
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
