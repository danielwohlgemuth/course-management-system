// Creates representative Enrollment__c records linking students to courses.
// Requires create_students.apex and seed_courses.apex to have been run first.
// Run via: sf apex run --file scripts/apex/seed_enrollments.apex

Map<String, Id> courseIds = new Map<String, Id>();
for (Course__c c : [SELECT Id, Course_Name__c FROM Course__c WHERE Course_Name__c IN ('Introduction to Algebra', 'World History', 'Biology 101', 'Creative Writing', 'Introduction to Programming', 'Art & Design Fundamentals', 'Physical Education')]) {
    courseIds.put(c.Course_Name__c, c.Id);
}

Map<String, Id> studentIds = new Map<String, Id>();
for (User u : [SELECT Id, Name FROM User WHERE Name IN ('Alice Chen', 'Ben Torres', 'Chloe Kim', 'David Patel', 'Emma Fischer')]) {
    studentIds.put(u.Name, u.Id);
}

List<Enrollment__c> enrollments = new List<Enrollment__c>{
    // Alice: Algebra, World History, Programming
    new Enrollment__c(Course__c = courseIds.get('Introduction to Algebra'),     Student__c = studentIds.get('Alice Chen')),
    new Enrollment__c(Course__c = courseIds.get('World History'),               Student__c = studentIds.get('Alice Chen')),
    new Enrollment__c(Course__c = courseIds.get('Introduction to Programming'), Student__c = studentIds.get('Alice Chen')),

    // Ben: Biology, Programming, Art & Design
    new Enrollment__c(Course__c = courseIds.get('Biology 101'),                 Student__c = studentIds.get('Ben Torres')),
    new Enrollment__c(Course__c = courseIds.get('Introduction to Programming'), Student__c = studentIds.get('Ben Torres')),
    new Enrollment__c(Course__c = courseIds.get('Art & Design Fundamentals'),   Student__c = studentIds.get('Ben Torres')),

    // Chloe: Algebra, Creative Writing, Physical Education
    new Enrollment__c(Course__c = courseIds.get('Introduction to Algebra'),     Student__c = studentIds.get('Chloe Kim')),
    new Enrollment__c(Course__c = courseIds.get('Creative Writing'),            Student__c = studentIds.get('Chloe Kim')),
    new Enrollment__c(Course__c = courseIds.get('Physical Education'),          Student__c = studentIds.get('Chloe Kim')),

    // David: World History, Biology, Creative Writing
    new Enrollment__c(Course__c = courseIds.get('World History'),               Student__c = studentIds.get('David Patel')),
    new Enrollment__c(Course__c = courseIds.get('Biology 101'),                 Student__c = studentIds.get('David Patel')),
    new Enrollment__c(Course__c = courseIds.get('Creative Writing'),            Student__c = studentIds.get('David Patel')),

    // Emma: Algebra, Programming, Art & Design
    new Enrollment__c(Course__c = courseIds.get('Introduction to Algebra'),     Student__c = studentIds.get('Emma Fischer')),
    new Enrollment__c(Course__c = courseIds.get('Introduction to Programming'), Student__c = studentIds.get('Emma Fischer')),
    new Enrollment__c(Course__c = courseIds.get('Art & Design Fundamentals'),   Student__c = studentIds.get('Emma Fischer'))
};
insert enrollments;

System.debug('Inserted ' + enrollments.size() + ' enrollment records');
