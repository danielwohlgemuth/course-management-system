@IsTest
private class CourseCalendarControllerTest {

    @TestSetup
    static void makeData() {
        Id userId = UserInfo.getUserId();
        Course__c c1 = new Course__c(Course_Name__c = 'Algebra', Instructor_User__c = userId);
        Course__c c2 = new Course__c(Course_Name__c = 'Biology', Instructor_User__c = userId);
        insert new List<Course__c>{ c1, c2 };
        insert new List<TimeSlot__c>{
            new TimeSlot__c(Course__c = c1.Id, Day_of_Week__c = 'Monday',
                            Start_Time__c = Time.newInstance(9,0,0,0),
                            End_Time__c   = Time.newInstance(10,30,0,0)),
            new TimeSlot__c(Course__c = c1.Id, Day_of_Week__c = 'Wednesday',
                            Start_Time__c = Time.newInstance(9,0,0,0),
                            End_Time__c   = Time.newInstance(10,30,0,0)),
            new TimeSlot__c(Course__c = c2.Id, Day_of_Week__c = 'Tuesday',
                            Start_Time__c = Time.newInstance(14,0,0,0),
                            End_Time__c   = Time.newInstance(15,0,0,0))
        };
    }

    @IsTest
    static void getTimeSlots_returnsAllSlotsWithCourseData() {
        Test.startTest();
        List<TimeSlot__c> slots = CourseCalendarController.getTimeSlots();
        Test.stopTest();

        Assert.isNotNull(slots, 'Expected non-null list');
        Assert.areEqual(3, slots.size(), 'Expected 3 time slots');
        for (TimeSlot__c s : slots) {
            Assert.isNotNull(s.Course__r.Course_Name__c, 'Course Name should be populated');
        }
    }

    @IsTest
    static void getConfig_returnsDefaultRecord() {
        Test.startTest();
        CourseCalendarConfig__mdt config = CourseCalendarController.getConfig();
        Test.stopTest();

        Assert.isNotNull(config, 'Expected config record');
        Assert.isNotNull(config.Grid_Start_Hour__c, 'Expected Grid_Start_Hour__c');
        Assert.isNotNull(config.Grid_End_Hour__c, 'Expected Grid_End_Hour__c');
        Assert.isNotNull(config.Palette__c, 'Expected Palette__c');
        Assert.isNotNull(config.Height_Pixels__c, 'Expected Height_Pixels__c');
        Assert.isNotNull(config.Semester__c, 'Expected Semester__c');
    }
}