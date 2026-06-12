// Assigns the CourseStudent permission set to all Customer Community Users.
// Run via: sf apex run --file scripts/apex/assign_student_permission_set.apex

Id profileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community User' LIMIT 1].Id;
Id psId      = [SELECT Id FROM PermissionSet WHERE Name = 'CourseStudent' LIMIT 1].Id;

List<User> students = [SELECT Id FROM User WHERE ProfileId = :profileId AND IsActive = true];

List<PermissionSetAssignment> assignments = new List<PermissionSetAssignment>();
for (User u : students) {
    assignments.add(new PermissionSetAssignment(
        AssigneeId      = u.Id,
        PermissionSetId = psId
    ));
}
insert assignments;

System.debug('Assigned CourseStudent permission set to ' + assignments.size() + ' users');
