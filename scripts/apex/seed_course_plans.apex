// Creates representative CoursePlan__c and Availability__c records:
// - "Chemistry 200": a feasible draft plan that schedules cleanly on lock
// - "Advanced Robotics": an infeasible draft plan that locks with a scheduling error
// Re-runnable: previously seeded plans are removed first (unlocking them if needed,
// which deletes their generated courses).
// Run via: sf apex run --file scripts/apex/seed_course_plans.apex

Set<String> seededNames = new Set<String>{ 'Chemistry 200', 'Advanced Robotics' };

List<CoursePlan__c> existing = [
    SELECT Id, Status__c FROM CoursePlan__c WHERE Course_Name__c IN :seededNames
];
for (CoursePlan__c plan : existing) {
    if (plan.Status__c == 'Locked') {
        CoursePlanLockService.unlock(plan.Id);
    }
}
delete existing;

User elena = [SELECT Id FROM User WHERE Name = 'Elena Marsh' LIMIT 1];

List<CoursePlan__c> plans = new List<CoursePlan__c>{
    new CoursePlan__c(
        Course_Name__c = 'Chemistry 200',
        Classroom__c = 'Room 104',
        Semester__c = '2026 S1',
        Classes_Per_Week__c = 2,
        Class_Duration_Minutes__c = 60,
        OwnerId = elena.Id
    ),
    new CoursePlan__c(
        Course_Name__c = 'Advanced Robotics',
        Classroom__c = 'Room 102',
        Semester__c = '2026 S1',
        Classes_Per_Week__c = 3,
        Class_Duration_Minutes__c = 60,
        OwnerId = elena.Id
    )
};
insert plans;

List<Availability__c> windows = new List<Availability__c>{
    // Chemistry 200 — two generous windows: schedules cleanly on lock
    new Availability__c(Course_Plan__c = plans[0].Id, Day_of_Week__c = 'Monday',    Start_Time__c = Time.newInstance(9, 0, 0, 0),  End_Time__c = Time.newInstance(11, 0, 0, 0)),
    new Availability__c(Course_Plan__c = plans[0].Id, Day_of_Week__c = 'Wednesday', Start_Time__c = Time.newInstance(13, 0, 0, 0), End_Time__c = Time.newInstance(15, 0, 0, 0)),

    // Advanced Robotics — one 90-minute window holds only 1 of 3 classes: locks with an error
    new Availability__c(Course_Plan__c = plans[1].Id, Day_of_Week__c = 'Friday', Start_Time__c = Time.newInstance(9, 0, 0, 0), End_Time__c = Time.newInstance(10, 30, 0, 0))
};
insert windows;

System.debug('Inserted ' + plans.size() + ' course plans and ' + windows.size() + ' availability windows');
