// Assigns the CourseInstructor permission set to all Customer Community Plus Users.
// Run via: sf apex run --file scripts/apex/assign_instructor_permission_set.apex

Id profileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User' LIMIT 1].Id;
Id psId      = [SELECT Id FROM PermissionSet WHERE Name = 'CourseInstructor' LIMIT 1].Id;

List<User> instructors = [SELECT Id FROM User WHERE ProfileId = :profileId AND IsActive = true];

List<PermissionSetAssignment> assignments = new List<PermissionSetAssignment>();
for (User u : instructors) {
    assignments.add(new PermissionSetAssignment(
        AssigneeId      = u.Id,
        PermissionSetId = psId
    ));
}
insert assignments;

System.debug('Assigned CourseInstructor permission set to ' + assignments.size() + ' users');
