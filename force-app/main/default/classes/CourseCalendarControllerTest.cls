@IsTest
private class CourseCalendarControllerTest {

    @TestSetup
    static void makeData() {
        Course__c c1 = new Course__c(Course_Name__c = 'Algebra', Instructor__c = 'Smith');
        Course__c c2 = new Course__c(Course_Name__c = 'Biology', Instructor__c = 'Jones');
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
}