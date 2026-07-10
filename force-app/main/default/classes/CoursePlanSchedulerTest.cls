@isTest
private class CoursePlanSchedulerTest {

    static Availability__c window(String day, Integer startHour, Integer startMinute, Integer endHour, Integer endMinute) {
        return new Availability__c(
            Day_of_Week__c = day,
            Start_Time__c = Time.newInstance(startHour, startMinute, 0, 0),
            End_Time__c = Time.newInstance(endHour, endMinute, 0, 0)
        );
    }

    static TimeSlot__c booked(String day, Integer startHour, Integer startMinute, Integer endHour, Integer endMinute) {
        return new TimeSlot__c(
            Day_of_Week__c = day,
            Start_Time__c = Time.newInstance(startHour, startMinute, 0, 0),
            End_Time__c = Time.newInstance(endHour, endMinute, 0, 0)
        );
    }

    static String describe(List<CoursePlanScheduler.SessionSlot> sessions) {
        List<String> parts = new List<String>();
        for (CoursePlanScheduler.SessionSlot s : sessions) {
            parts.add(s.dayOfWeek + ' ' + s.startTime + '-' + s.endTime);
        }
        return String.join(parts, ', ');
    }

    @isTest
    static void buildScheduleExactFitTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            2, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 10, 0), window('Wednesday', 9, 0, 10, 0) },
            new List<TimeSlot__c>(),
            'Room 101'
        );

        Assert.isTrue(result.success, 'Two 60-minute windows should fit two 60-minute classes');
        Assert.areEqual(2, result.sessions.size(), 'Both classes should be placed');
        Assert.areEqual('Monday', result.sessions[0].dayOfWeek, 'First session should be Monday');
        Assert.areEqual(Time.newInstance(9, 0, 0, 0), result.sessions[0].startTime, 'Monday session should start at window start');
        Assert.areEqual(Time.newInstance(10, 0, 0, 0), result.sessions[0].endTime, 'Monday session should run the full duration');
        Assert.areEqual('Wednesday', result.sessions[1].dayOfWeek, 'Second session should be Wednesday');
    }

    @isTest
    static void buildSchedulePacksMultiplePerWindowTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            3, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 10, 30), window('Wednesday', 9, 0, 11, 0) },
            new List<TimeSlot__c>(),
            'Room 101'
        );

        Assert.isTrue(result.success, 'Capacity is 1 (Mon) + 2 (Wed) = 3, enough for 3 classes: ' + result.errorMessage);
        Assert.areEqual(3, result.sessions.size(), 'All three classes should be placed');
        Assert.areEqual('Wednesday', result.sessions[1].dayOfWeek, 'Round one should place the second class on Wednesday');
        Assert.areEqual(Time.newInstance(9, 0, 0, 0), result.sessions[1].startTime, 'First Wednesday class should start at 9:00');
        Assert.areEqual('Wednesday', result.sessions[2].dayOfWeek, 'Round two should place the third class back on Wednesday');
        Assert.areEqual(Time.newInstance(10, 0, 0, 0), result.sessions[2].startTime, 'Second Wednesday class should start back-to-back at 10:00');
    }

    @isTest
    static void buildScheduleSpreadsAcrossDaysTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            2, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 12, 0), window('Tuesday', 9, 0, 10, 0) },
            new List<TimeSlot__c>(),
            'Room 101'
        );

        Assert.isTrue(result.success, 'Schedule should succeed: ' + result.errorMessage);
        Assert.areEqual('Monday', result.sessions[0].dayOfWeek, 'First class should land on Monday');
        Assert.areEqual('Tuesday', result.sessions[1].dayOfWeek,
            'Round-robin should spread the second class to Tuesday even though Monday has room: ' + describe(result.sessions));
    }

    @isTest
    static void buildScheduleAvoidsExistingConflictTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            1, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 11, 30) },
            new List<TimeSlot__c>{ booked('Monday', 9, 30, 10, 30) },
            'Room 101'
        );

        Assert.isTrue(result.success, 'A slot after the existing booking should be found: ' + result.errorMessage);
        Assert.areEqual(Time.newInstance(10, 30, 0, 0), result.sessions[0].startTime,
            'Placement should jump to the end of the conflicting booking');
        Assert.areEqual(Time.newInstance(11, 30, 0, 0), result.sessions[0].endTime, 'Session should fit exactly before window end');
    }

    @isTest
    static void buildScheduleOffGridConflictTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            1, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 12, 0) },
            new List<TimeSlot__c>{ booked('Monday', 9, 5, 10, 5) },
            'Room 101'
        );

        Assert.isTrue(result.success, 'Off-grid existing bookings should still leave room: ' + result.errorMessage);
        Assert.areEqual(Time.newInstance(10, 5, 0, 0), result.sessions[0].startTime,
            'Placement must land exactly at the off-grid booking end, proving there is no step granularity');
    }

    @isTest
    static void buildScheduleOverlappingWindowsNoSelfOverlapTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            2, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 11, 0), window('Monday', 10, 0, 12, 0) },
            new List<TimeSlot__c>(),
            'Room 101'
        );

        Assert.isTrue(result.success, 'Overlapping windows on one day should still schedule: ' + result.errorMessage);
        Assert.areEqual(2, result.sessions.size(), 'Both classes should be placed');
        Assert.areEqual(Time.newInstance(9, 0, 0, 0), result.sessions[0].startTime, 'First class at 9:00');
        Assert.areEqual(Time.newInstance(10, 0, 0, 0), result.sessions[1].startTime,
            'Second class must not overlap the first even though the declared windows overlap');
    }

    @isTest
    static void buildScheduleNoWindowsTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            1, 60, new List<Availability__c>(), new List<TimeSlot__c>(), 'Room 101'
        );

        Assert.isFalse(result.success, 'No windows means no schedule');
        Assert.areEqual(0, result.sessions.size(), 'Failure must not return partial sessions');
        Assert.isTrue(result.errorMessage.contains('no availability windows'),
            'Message should explain the missing windows: ' + result.errorMessage);
    }

    @isTest
    static void buildScheduleDurationExceedsWindowsTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            1, 90,
            new List<Availability__c>{ window('Monday', 9, 0, 10, 0) },
            new List<TimeSlot__c>(),
            'Room 101'
        );

        Assert.isFalse(result.success, 'A 90-minute class cannot fit a 60-minute window');
        Assert.isTrue(result.errorMessage.contains('at least 90 minutes'),
            'Message should call out the duration problem: ' + result.errorMessage);
    }

    @isTest
    static void buildScheduleInsufficientCapacityTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            3, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 10, 0) },
            new List<TimeSlot__c>(),
            'Room 101'
        );

        Assert.isFalse(result.success, 'One 60-minute window cannot hold three classes');
        Assert.areEqual(0, result.sessions.size(), 'Failure must not return partial sessions');
        Assert.isTrue(result.errorMessage.contains('1 of 3'),
            'Message should say how many classes fit: ' + result.errorMessage);
    }

    @isTest
    static void buildScheduleConflictsConsumeCapacityTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            2, 60,
            new List<Availability__c>{ window('Monday', 9, 0, 11, 0) },
            new List<TimeSlot__c>{ booked('Monday', 9, 0, 10, 0) },
            'Room 101'
        );

        Assert.isFalse(result.success, 'The existing booking leaves room for only one class');
        Assert.isTrue(result.errorMessage.contains('Existing courses in Room 101'),
            'Message should mention that existing courses consumed the availability: ' + result.errorMessage);
    }

    @isTest
    static void buildScheduleInvalidWindowTest() {
        CoursePlanScheduler.ScheduleResult result = CoursePlanScheduler.buildSchedule(
            1, 30,
            new List<Availability__c>{ window('Monday', 10, 0, 10, 0) },
            new List<TimeSlot__c>(),
            'Room 101'
        );

        Assert.isFalse(result.success, 'A zero-length window is invalid');
        Assert.isTrue(result.errorMessage.contains('end time that is not after its start time'),
            'Message should describe the invalid window: ' + result.errorMessage);
    }

    @isTest
    static void buildScheduleDeterministicTest() {
        List<Availability__c> windows = new List<Availability__c>{
            window('Wednesday', 13, 0, 16, 0), window('Monday', 9, 0, 12, 0), window('Friday', 8, 0, 9, 30)
        };
        List<TimeSlot__c> existing = new List<TimeSlot__c>{ booked('Monday', 10, 0, 11, 0) };

        CoursePlanScheduler.ScheduleResult first = CoursePlanScheduler.buildSchedule(4, 60, windows, existing, 'Room 101');
        CoursePlanScheduler.ScheduleResult second = CoursePlanScheduler.buildSchedule(4, 60, windows, existing, 'Room 101');

        Assert.isTrue(first.success, 'Schedule should succeed: ' + first.errorMessage);
        Assert.areEqual(describe(first.sessions), describe(second.sessions), 'Identical inputs must produce identical schedules');
    }
}
