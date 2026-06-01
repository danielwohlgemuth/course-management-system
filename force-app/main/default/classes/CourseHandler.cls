public without sharing class CourseHandler {
    public static void onAfterInsert(List<Course__c> newCourses) {
        List<Group> groups = new List<Group>();
        for (Course__c course : newCourses) {
            groups.add(new Group(Name = course.Course_Name__c, Type = 'Regular'));
        }
        insert groups;

        List<Course__c> toUpdate = new List<Course__c>();
        List<Course__Share> shares = new List<Course__Share>();
        for (Integer i = 0; i < newCourses.size(); i++) {
            Id groupId = groups[i].Id;
            toUpdate.add(new Course__c(Id = newCourses[i].Id, Public_Group_Id__c = groupId));
            shares.add(new Course__Share(
                ParentId = newCourses[i].Id,
                UserOrGroupId = groupId,
                AccessLevel = 'Read',
                RowCause = Schema.Course__Share.RowCause.Manual
            ));
        }
        update toUpdate;
        insert shares;
    }

    public static void onBeforeDelete(List<Course__c> oldCourses) {
        List<Id> groupIds = new List<Id>();
        for (Course__c course : oldCourses) {
            if (course.Public_Group_Id__c != null) {
                groupIds.add(course.Public_Group_Id__c);
            }
        }
        if (!groupIds.isEmpty()) {
            deleteGroupsAsync(groupIds);
        }
    }

    // Group is a setup object; deleting it in the same transaction as a Course delete
    // (non-setup DML) causes MIXED_DML_OPERATION. Running async sidesteps this.
    @future
    private static void deleteGroupsAsync(List<Id> groupIds) {
        delete [SELECT Id FROM Group WHERE Id IN :groupIds];
    }
}
