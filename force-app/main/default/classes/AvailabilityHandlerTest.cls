@isTest
private class AvailabilityHandlerTest {

    static CoursePlan__c makeDraftPlan(String name, String classroom) {
        CoursePlan__c plan = new CoursePlan__c(
            Course_Name__c = name,
            Classroom__c = classroom,
            Semester__c = '2026 S1',
            Classes_Per_Week__c = 1,
            Class_Duration_Minutes__c = 60
        );
        insert plan;
        return plan;
    }

    static Availability__c makeWindow(Id planId, String day, Integer startHour, Integer endHour) {
        return new Availability__c(
            Course_Plan__c = planId,
            Day_of_Week__c = day,
            Start_Time__c = Time.newInstance(startHour, 0, 0, 0),
            End_Time__c = Time.newInstance(endHour, 0, 0, 0)
        );
    }

    @isTest
    static void enforceDraftOnlyInsertAllowedWhileDraftTest() {
        CoursePlan__c plan = makeDraftPlan('Draft Insert Plan', 'Room 101');

        Test.startTest();
        insert makeWindow(plan.Id, 'Monday', 9, 11);
        Test.stopTest();

        Assert.areEqual(1, [SELECT COUNT() FROM Availability__c WHERE Course_Plan__c = :plan.Id],
            'Inserting a window under a draft plan should succeed');
    }

    @isTest
    static void enforceDraftOnlyUpdateAndDeleteAllowedWhileDraftTest() {
        CoursePlan__c plan = makeDraftPlan('Draft Change Plan', 'Room 101');
        Availability__c window = makeWindow(plan.Id, 'Monday', 9, 11);
        insert window;

        window.Start_Time__c = Time.newInstance(10, 0, 0, 0);
        update window;
        delete window;

        Assert.areEqual(0, [SELECT COUNT() FROM Availability__c WHERE Course_Plan__c = :plan.Id],
            'Updating then deleting a window under a draft plan should succeed');
    }

    @isTest
    static void enforceDraftOnlyInsertBlockedWhenLockedTest() {
        CoursePlan__c plan = makeDraftPlan('Locked Insert Plan', 'Room 101');
        insert makeWindow(plan.Id, 'Monday', 9, 11);
        CoursePlanLockService.lock(plan.Id);

        try {
            insert makeWindow(plan.Id, 'Tuesday', 9, 11);
            Assert.fail('Inserting a window under a locked plan should be blocked');
        } catch (DmlException e) {
            Assert.isTrue(e.getDmlMessage(0).contains('Draft status'),
                'Error should explain the draft-only rule: ' + e.getDmlMessage(0));
        }
    }

    @isTest
    static void enforceDraftOnlyUpdateBlockedWhenLockedTest() {
        CoursePlan__c plan = makeDraftPlan('Locked Update Plan', 'Room 102');
        Availability__c window = makeWindow(plan.Id, 'Monday', 9, 11);
        insert window;
        CoursePlanLockService.lock(plan.Id);

        window.Start_Time__c = Time.newInstance(10, 0, 0, 0);
        try {
            update window;
            Assert.fail('Updating a window under a locked plan should be blocked');
        } catch (DmlException e) {
            Assert.isTrue(e.getDmlMessage(0).contains('Draft status'),
                'Error should explain the draft-only rule: ' + e.getDmlMessage(0));
        }
    }

    @isTest
    static void enforceDraftOnlyDeleteBlockedWhenLockedTest() {
        CoursePlan__c plan = makeDraftPlan('Locked Delete Plan', 'Room 103');
        Availability__c window = makeWindow(plan.Id, 'Monday', 9, 11);
        insert window;
        CoursePlanLockService.lock(plan.Id);

        try {
            delete window;
            Assert.fail('Deleting a window under a locked plan should be blocked');
        } catch (DmlException e) {
            Assert.isTrue(e.getDmlMessage(0).contains('Draft status'),
                'Error should explain the draft-only rule: ' + e.getDmlMessage(0));
        }
    }

    @isTest
    static void enforceDraftOnlyBulkMixedParentsTest() {
        CoursePlan__c draftPlan = makeDraftPlan('Bulk Draft Plan', 'Room 101');
        CoursePlan__c lockedPlan = makeDraftPlan('Bulk Locked Plan', 'Room 104');
        insert makeWindow(lockedPlan.Id, 'Monday', 9, 11);
        CoursePlanLockService.lock(lockedPlan.Id);

        Test.startTest();
        List<Database.SaveResult> results = Database.insert(
            new List<Availability__c>{
                makeWindow(draftPlan.Id, 'Tuesday', 9, 11),
                makeWindow(lockedPlan.Id, 'Tuesday', 9, 11)
            },
            false
        );
        Test.stopTest();

        Assert.isTrue(results[0].isSuccess(), 'Window under the draft plan should insert');
        Assert.isFalse(results[1].isSuccess(), 'Window under the locked plan should be rejected');
    }

    @isTest
    static void endAfterStartValidationTest() {
        CoursePlan__c plan = makeDraftPlan('Validation Plan', 'Room 101');
        Availability__c window = makeWindow(plan.Id, 'Monday', 11, 9);

        try {
            insert window;
            Assert.fail('A window ending before it starts should fail validation');
        } catch (DmlException e) {
            Assert.isTrue(e.getDmlMessage(0).contains('End time must be after start time'),
                'Validation rule message expected: ' + e.getDmlMessage(0));
        }
    }
}
