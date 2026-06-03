@isTest
private class CourseHandlerTest {
    @isTest
    static void testInsertCreatesGroupAndShare() {
        Course__c course = new Course__c(Course_Name__c = 'Test Course');

        Test.startTest();
        insert course;
        Test.stopTest();

        course = [SELECT Id, Public_Group_Id__c FROM Course__c WHERE Id = :course.Id];
        System.assertNotEquals(null, course.Public_Group_Id__c, 'Public_Group_Id__c should be set after insert');

        List<Group> groups = [SELECT Id, Name, Type FROM Group WHERE Id = :course.Public_Group_Id__c];
        System.assertEquals(1, groups.size(), 'One group should be created');
        System.assertEquals('Test Course', groups[0].Name, 'Group name should match course name');
        System.assertEquals('Regular', groups[0].Type, 'Group type should be Regular');

        List<Course__Share> shares = [
            SELECT Id, AccessLevel
            FROM Course__Share
            WHERE ParentId = :course.Id AND UserOrGroupId = :course.Public_Group_Id__c
        ];
        System.assertEquals(1, shares.size(), 'One Course__Share should be created');
        System.assertEquals('Read', shares[0].AccessLevel, 'Course__Share should have Read access');
    }

    @isTest
    static void testDeleteRemovesGroup() {
        Course__c course = new Course__c(Course_Name__c = 'Delete Test Course');
        insert course;

        course = [SELECT Id, Public_Group_Id__c FROM Course__c WHERE Id = :course.Id];
        Id groupId = course.Public_Group_Id__c;
        System.assertNotEquals(null, groupId, 'Group should be created on insert');

        Test.startTest();
        delete course;
        Test.stopTest();

        List<Group> groups = [SELECT Id FROM Group WHERE Id = :groupId];
        System.assertEquals(0, groups.size(), 'Group should be deleted with the course');
    }

    @isTest
    static void testBulkInsert() {
        List<Course__c> courses = new List<Course__c>();
        for (Integer i = 0; i < 10; i++) {
            courses.add(new Course__c(Course_Name__c = 'Bulk Course ' + i));
        }

        Test.startTest();
        insert courses;
        Test.stopTest();

        List<Course__c> inserted = [SELECT Id, Public_Group_Id__c FROM Course__c WHERE Id IN :courses];
        System.assertEquals(10, inserted.size(), 'All 10 courses should be present');
        for (Course__c c : inserted) {
            System.assertNotEquals(null, c.Public_Group_Id__c, 'Every course should have a Public_Group_Id__c');
        }

        List<Course__Share> shares = [SELECT Id FROM Course__Share WHERE ParentId IN :courses AND RowCause = 'Manual'];
        System.assertEquals(10, shares.size(), 'Each course should have one manual Course__Share');
    }

    @isTest
    static void testDeleteWithNullGroupIdIsNoOp() {
        // Defensive: onBeforeDelete should not throw when Public_Group_Id__c is null
        Course__c course = new Course__c(Course_Name__c = 'Null Group Course');
        insert course;

        Course__c stub = new Course__c(Id = course.Id, Public_Group_Id__c = null);

        Test.startTest();
        CourseHandler.onBeforeDelete(new List<Course__c>{ stub });
        Test.stopTest();

        System.assert(true, 'No exception should be thrown for null group ID');
    }
}