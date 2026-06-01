@isTest
private class EnrollmentHandlerTest {

    static User buildTestUser() {
        Profile p = [SELECT Id FROM Profile WHERE Name = 'Standard User' LIMIT 1];
        return new User(
            FirstName = 'Test',
            LastName = 'Student',
            Email = 'test.enroll.handler@example.com',
            Username = 'test.enroll.handler.' + UserInfo.getOrganizationId() + '@example.com',
            Alias = 'tenrstu',
            ProfileId = p.Id,
            TimeZoneSidKey = 'America/Los_Angeles',
            LocaleSidKey = 'en_US',
            EmailEncodingKey = 'UTF-8',
            LanguageLocaleKey = 'en_US'
        );
    }

    @TestSetup
    static void setup() {
        // Insert User (setup object) in System.runAs to avoid MIXED_DML with Course__c insert below
        User student = buildTestUser();
        System.runAs(new User(Id = UserInfo.getUserId())) {
            insert student;
        }

        List<Course__c> courses = new List<Course__c>();
        courses.add(new Course__c(Course_Name__c = 'Enrollment Handler Test Course'));
        for (Integer i = 0; i < 10; i++) {
            courses.add(new Course__c(Course_Name__c = 'Bulk Enrollment Course ' + i));
        }
        insert courses;

        // Flush CourseTrigger futures so Public_Group_Id__c is populated before test methods run
        Test.startTest();
        Test.stopTest();
    }

    @isTest
    static void testInsertAddsGroupMember() {
        User student = [SELECT Id FROM User WHERE Email = 'test.enroll.handler@example.com' LIMIT 1];
        Course__c course = [SELECT Id, Public_Group_Id__c FROM Course__c WHERE Course_Name__c = 'Enrollment Handler Test Course' LIMIT 1];
        System.assertNotEquals(null, course.Public_Group_Id__c, 'Course group must be set before testing enrollments');

        Enrollment__c enrollment = new Enrollment__c(Course__c = course.Id, Student__c = student.Id);

        Test.startTest();
        insert enrollment;
        Test.stopTest();

        List<GroupMember> members = [
            SELECT Id FROM GroupMember
            WHERE GroupId = :course.Public_Group_Id__c AND UserOrGroupId = :student.Id
        ];
        System.assertEquals(1, members.size(), 'Student should be added to the course group on enrollment insert');
    }

    @isTest
    static void testDeleteRemovesGroupMember() {
        User student = [SELECT Id FROM User WHERE Email = 'test.enroll.handler@example.com' LIMIT 1];
        Course__c course = [SELECT Id, Public_Group_Id__c FROM Course__c WHERE Course_Name__c = 'Enrollment Handler Test Course' LIMIT 1];

        // Pre-create the GroupMember in System.runAs to avoid MIXED_DML with Enrollment__c DML below
        System.runAs(new User(Id = UserInfo.getUserId())) {
            insert new GroupMember(GroupId = course.Public_Group_Id__c, UserOrGroupId = student.Id);
        }

        Enrollment__c enrollment = new Enrollment__c(Course__c = course.Id, Student__c = student.Id);
        insert enrollment;

        List<GroupMember> beforeDelete = [
            SELECT Id FROM GroupMember
            WHERE GroupId = :course.Public_Group_Id__c AND UserOrGroupId = :student.Id
        ];
        System.assertEquals(1, beforeDelete.size(), 'GroupMember should exist before delete');

        Test.startTest();
        delete enrollment;
        Test.stopTest();

        List<GroupMember> afterDelete = [
            SELECT Id FROM GroupMember
            WHERE GroupId = :course.Public_Group_Id__c AND UserOrGroupId = :student.Id
        ];
        System.assertEquals(0, afterDelete.size(), 'Student should be removed from the course group on enrollment delete');
    }

    @isTest
    static void testBulkInsertAddsGroupMembers() {
        User student = [SELECT Id FROM User WHERE Email = 'test.enroll.handler@example.com' LIMIT 1];
        List<Course__c> courses = [SELECT Id, Course_Name__c, Public_Group_Id__c FROM Course__c WHERE Course_Name__c LIKE 'Bulk Enrollment Course%'];
        System.assertEquals(10, courses.size(), '10 bulk courses should exist from setup');

        List<Enrollment__c> enrollments = new List<Enrollment__c>();
        for (Course__c c : courses) {
            enrollments.add(new Enrollment__c(Course__c = c.Id, Student__c = student.Id));
        }

        Test.startTest();
        insert enrollments;
        Test.stopTest();

        for (Course__c c : courses) {
            List<GroupMember> members = [
                SELECT Id FROM GroupMember
                WHERE GroupId = :c.Public_Group_Id__c AND UserOrGroupId = :student.Id
            ];
            System.assertEquals(1, members.size(), 'Student should be added to group for course ' + c.Course_Name__c);
        }
    }

    @isTest
    static void testBulkDeleteRemovesGroupMembers() {
        User student = [SELECT Id FROM User WHERE Email = 'test.enroll.handler@example.com' LIMIT 1];
        List<Course__c> courses = [SELECT Id, Course_Name__c, Public_Group_Id__c FROM Course__c WHERE Course_Name__c LIKE 'Bulk Enrollment Course%'];

        // Pre-create GroupMembers in System.runAs to avoid MIXED_DML with Enrollment__c inserts below
        List<GroupMember> members = new List<GroupMember>();
        for (Course__c c : courses) {
            members.add(new GroupMember(GroupId = c.Public_Group_Id__c, UserOrGroupId = student.Id));
        }
        System.runAs(new User(Id = UserInfo.getUserId())) {
            insert members;
        }

        List<Enrollment__c> enrollments = new List<Enrollment__c>();
        for (Course__c c : courses) {
            enrollments.add(new Enrollment__c(Course__c = c.Id, Student__c = student.Id));
        }
        insert enrollments;

        Test.startTest();
        delete enrollments;
        Test.stopTest();

        for (Course__c c : courses) {
            List<GroupMember> remaining = [
                SELECT Id FROM GroupMember
                WHERE GroupId = :c.Public_Group_Id__c AND UserOrGroupId = :student.Id
            ];
            System.assertEquals(0, remaining.size(), 'Student should be removed from group for course ' + c.Course_Name__c);
        }
    }
}
