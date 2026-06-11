// Creates representative Course__c and TimeSlot__c records.
// Run via: SFDX: Execute Anonymous Apex with Editor Contents

List<Course__c> courses = new List<Course__c>{
    new Course__c(Course_Name__c = 'Introduction to Algebra',    Instructor__c = 'Elena Marsh'),
    new Course__c(Course_Name__c = 'World History',              Instructor__c = 'James Okafor'),
    new Course__c(Course_Name__c = 'Biology 101',                Instructor__c = 'Priya Nair'),
    new Course__c(Course_Name__c = 'Creative Writing',           Instructor__c = 'Sandra Voss'),
    new Course__c(Course_Name__c = 'Introduction to Programming', Instructor__c = 'Carlos Rivera'),
    new Course__c(Course_Name__c = 'Art & Design Fundamentals',  Instructor__c = 'Sandra Voss'),
    new Course__c(Course_Name__c = 'Physical Education',         Instructor__c = 'Priya Nair')
};
insert courses;

Map<String, Id> courseIds = new Map<String, Id>();
for (Course__c c : courses) {
    courseIds.put(c.Course_Name__c, c.Id);
}

List<TimeSlot__c> slots = new List<TimeSlot__c>{
    // Algebra — Mon/Wed/Fri morning
    new TimeSlot__c(Course__c = courseIds.get('Introduction to Algebra'),     Day_of_Week__c = 'Monday',    Start_Time__c = Time.newInstance(8,  0, 0, 0), End_Time__c = Time.newInstance(9,  0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Introduction to Algebra'),     Day_of_Week__c = 'Wednesday', Start_Time__c = Time.newInstance(8,  0, 0, 0), End_Time__c = Time.newInstance(9,  0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Introduction to Algebra'),     Day_of_Week__c = 'Friday',    Start_Time__c = Time.newInstance(8,  0, 0, 0), End_Time__c = Time.newInstance(9,  0, 0, 0)),

    // World History — Tue/Thu mid-morning
    new TimeSlot__c(Course__c = courseIds.get('World History'),               Day_of_Week__c = 'Tuesday',   Start_Time__c = Time.newInstance(9,  0, 0, 0), End_Time__c = Time.newInstance(10, 30, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('World History'),               Day_of_Week__c = 'Thursday',  Start_Time__c = Time.newInstance(9,  0, 0, 0), End_Time__c = Time.newInstance(10, 30, 0, 0)),

    // Biology 101 — Mon/Wed afternoon + Saturday lab
    new TimeSlot__c(Course__c = courseIds.get('Biology 101'),                 Day_of_Week__c = 'Monday',    Start_Time__c = Time.newInstance(13, 0, 0, 0), End_Time__c = Time.newInstance(14, 0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Biology 101'),                 Day_of_Week__c = 'Wednesday', Start_Time__c = Time.newInstance(13, 0, 0, 0), End_Time__c = Time.newInstance(14, 0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Biology 101'),                 Day_of_Week__c = 'Saturday',  Start_Time__c = Time.newInstance(10, 0, 0, 0), End_Time__c = Time.newInstance(12, 0, 0, 0)),

    // Creative Writing — Tue/Thu evening
    new TimeSlot__c(Course__c = courseIds.get('Creative Writing'),            Day_of_Week__c = 'Tuesday',   Start_Time__c = Time.newInstance(17, 0, 0, 0), End_Time__c = Time.newInstance(18, 30, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Creative Writing'),            Day_of_Week__c = 'Thursday',  Start_Time__c = Time.newInstance(17, 0, 0, 0), End_Time__c = Time.newInstance(18, 30, 0, 0)),

    // Intro to Programming — Mon/Wed/Fri afternoon
    new TimeSlot__c(Course__c = courseIds.get('Introduction to Programming'), Day_of_Week__c = 'Monday',    Start_Time__c = Time.newInstance(14, 0, 0, 0), End_Time__c = Time.newInstance(15, 0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Introduction to Programming'), Day_of_Week__c = 'Wednesday', Start_Time__c = Time.newInstance(14, 0, 0, 0), End_Time__c = Time.newInstance(15, 0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Introduction to Programming'), Day_of_Week__c = 'Friday',    Start_Time__c = Time.newInstance(14, 0, 0, 0), End_Time__c = Time.newInstance(15, 0, 0, 0)),

    // Art & Design — overlap with Algebra on Mon to exercise the calendar overlap rendering
    new TimeSlot__c(Course__c = courseIds.get('Art & Design Fundamentals'),   Day_of_Week__c = 'Monday',    Start_Time__c = Time.newInstance(8,  30, 0, 0), End_Time__c = Time.newInstance(10, 0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Art & Design Fundamentals'),   Day_of_Week__c = 'Friday',    Start_Time__c = Time.newInstance(10, 0, 0, 0), End_Time__c = Time.newInstance(11, 30, 0, 0)),

    // Physical Education — weekend sessions to exercise Saturday/Sunday columns
    new TimeSlot__c(Course__c = courseIds.get('Physical Education'),          Day_of_Week__c = 'Saturday',  Start_Time__c = Time.newInstance(8,  0, 0, 0), End_Time__c = Time.newInstance(9,  0, 0, 0)),
    new TimeSlot__c(Course__c = courseIds.get('Physical Education'),          Day_of_Week__c = 'Sunday',    Start_Time__c = Time.newInstance(8,  0, 0, 0), End_Time__c = Time.newInstance(9,  0, 0, 0)),

    // Biology 101 Sunday session — overlaps with Physical Education on Sunday
    new TimeSlot__c(Course__c = courseIds.get('Biology 101'),                 Day_of_Week__c = 'Sunday',    Start_Time__c = Time.newInstance(8,  30, 0, 0), End_Time__c = Time.newInstance(10, 0, 0, 0))
};
insert slots;

System.debug('Inserted ' + courses.size() + ' courses and ' + slots.size() + ' time slots');
