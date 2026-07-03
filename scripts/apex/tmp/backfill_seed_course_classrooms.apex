// Backfills Classroom__c on the existing seeded Course__c records so the org
// matches the updated scripts/apex/seed_courses.apex.
Map<String, String> classroomByCourseName = new Map<String, String>{
    'Introduction to Algebra'     => 'Room 101',
    'World History'               => 'Room 102',
    'Biology 101'                 => 'Room 103',
    'Creative Writing'            => 'Room 104',
    'Introduction to Programming' => 'Room 101',
    'Art & Design Fundamentals'   => 'Room 102',
    'Physical Education'          => 'Room 103'
};

List<Course__c> coursesToUpdate = [
    SELECT Id, Course_Name__c
    FROM Course__c
    WHERE Course_Name__c IN :classroomByCourseName.keySet()
];
for (Course__c c : coursesToUpdate) {
    c.Classroom__c = classroomByCourseName.get(c.Course_Name__c);
}
update coursesToUpdate;
System.debug('Backfilled Classroom__c on ' + coursesToUpdate.size() + ' Course__c records.');
