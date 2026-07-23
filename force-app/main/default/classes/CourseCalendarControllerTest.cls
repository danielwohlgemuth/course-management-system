@IsTest
private class CourseCalendarControllerTest {
  @TestSetup
  static void makeData() {
    Id userId = UserInfo.getUserId();
    Course__c c1 = new Course__c(
      Course_Name__c = 'Algebra',
      Instructor_User__c = userId,
      Semester__c = '2026 S1',
      Classroom__c = 'Room 101'
    );
    Course__c c2 = new Course__c(
      Course_Name__c = 'Biology',
      Instructor_User__c = userId,
      Classroom__c = 'Room 102'
    );
    insert new List<Course__c>{ c1, c2 };
    insert new List<TimeSlot__c>{
      new TimeSlot__c(
        Course__c = c1.Id,
        Day_of_Week__c = 'Monday',
        Start_Time__c = Time.newInstance(9, 0, 0, 0),
        End_Time__c = Time.newInstance(10, 30, 0, 0)
      ),
      new TimeSlot__c(
        Course__c = c1.Id,
        Day_of_Week__c = 'Wednesday',
        Start_Time__c = Time.newInstance(9, 0, 0, 0),
        End_Time__c = Time.newInstance(10, 30, 0, 0)
      ),
      new TimeSlot__c(
        Course__c = c2.Id,
        Day_of_Week__c = 'Tuesday',
        Start_Time__c = Time.newInstance(14, 0, 0, 0),
        End_Time__c = Time.newInstance(15, 0, 0, 0)
      )
    };
  }

  @IsTest
  static void getTimeSlotsWithoutSemesterTest() {
    Test.startTest();
    List<TimeSlot__c> slots = CourseCalendarController.getTimeSlots(null);
    Test.stopTest();

    Assert.isNotNull(slots, 'Expected non-null list');
    Assert.areEqual(
      3,
      slots.size(),
      'Expected all 3 time slots when no semester filter is applied'
    );
    for (TimeSlot__c s : slots) {
      Assert.isNotNull(
        s.Course__r.Course_Name__c,
        'Course Name should be populated'
      );
    }
  }

  @IsTest
  static void getTimeSlotsWithSemesterTest() {
    Test.startTest();
    List<TimeSlot__c> slots = CourseCalendarController.getTimeSlots('2026 S1');
    Test.stopTest();

    Assert.isNotNull(slots, 'Expected non-null list');
    Assert.areEqual(
      2,
      slots.size(),
      'Expected only the 2 slots for the 2026 S1 course'
    );
    for (TimeSlot__c s : slots) {
      Assert.areEqual(
        '2026 S1',
        s.Course__r.Semester__c,
        'Slots should belong to the filtered semester'
      );
      Assert.isNotNull(
        s.Course__r.Classroom__c,
        'Classroom should be populated on the queried course'
      );
    }
  }

  @IsTest
  static void getConfigTest() {
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
