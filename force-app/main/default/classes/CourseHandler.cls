public without sharing class CourseHandler {
    public static void onAfterInsert(List<Course__c> newCourses) {
        List<Group> groups = new List<Group>();
        for (Course__c course : newCourses) {
            groups.add(new Group(Name = course.Course_Name__c, Type = 'Regular'));
        }
        try {
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
                // Share with the instructor so they can see and edit their course.
                // Skip when instructor is the record owner — they already have full access.
                if (newCourses[i].Instructor_User__c != null &&
                    newCourses[i].Instructor_User__c != newCourses[i].OwnerId) {
                    shares.add(new Course__Share(
                        ParentId = newCourses[i].Id,
                        UserOrGroupId = newCourses[i].Instructor_User__c,
                        AccessLevel = 'Edit',
                        RowCause = Schema.Course__Share.RowCause.Manual
                    ));
                }
            }
            update toUpdate;
            insert shares;
        } catch (Exception e) {
            ErrorLogService.log('Apex', 'CourseHandler.onAfterInsert', e.getMessage(), e.getStackTraceString());
            throw e;
        }
    }

    public static void onAfterUpdate(List<Course__c> newCourses, Map<Id, Course__c> oldMap) {
        Map<Id, Id> oldInstructorByCourse = new Map<Id, Id>();
        List<Course__Share> newShares = new List<Course__Share>();

        for (Course__c course : newCourses) {
            Course__c old = oldMap.get(course.Id);
            if (course.Instructor_User__c == old.Instructor_User__c) continue;

            if (old.Instructor_User__c != null && old.Instructor_User__c != old.OwnerId) {
                oldInstructorByCourse.put(course.Id, old.Instructor_User__c);
            }
            if (course.Instructor_User__c != null && course.Instructor_User__c != course.OwnerId) {
                newShares.add(new Course__Share(
                    ParentId = course.Id,
                    UserOrGroupId = course.Instructor_User__c,
                    AccessLevel = 'Edit',
                    RowCause = Schema.Course__Share.RowCause.Manual
                ));
            }
        }

        try {
            if (!oldInstructorByCourse.isEmpty()) {
                Set<Id> oldInstructorIds = new Set<Id>(oldInstructorByCourse.values());
                List<Course__Share> toDelete = new List<Course__Share>();
                for (Course__Share cs : [
                    SELECT Id, ParentId, UserOrGroupId
                    FROM Course__Share
                    WHERE ParentId IN :oldInstructorByCourse.keySet()
                      AND UserOrGroupId IN :oldInstructorIds
                      AND RowCause = 'Manual'
                ]) {
                    if (oldInstructorByCourse.get(cs.ParentId) == cs.UserOrGroupId) {
                        toDelete.add(cs);
                    }
                }
                if (!toDelete.isEmpty()) delete toDelete;
            }

            if (!newShares.isEmpty()) insert newShares;
        } catch (Exception e) {
            ErrorLogService.log('Apex', 'CourseHandler.onAfterUpdate', e.getMessage(), e.getStackTraceString());
            throw e;
        }
    }

    public static void onBeforeDelete(List<Course__c> oldCourses) {
        try {
            List<Id> groupIds = new List<Id>();
            for (Course__c course : oldCourses) {
                if (course.Public_Group_Id__c != null) {
                    groupIds.add(course.Public_Group_Id__c);
                }
            }
            if (!groupIds.isEmpty()) {
                deleteGroupsAsync(groupIds);
            }
        } catch (Exception e) {
            ErrorLogService.log('Apex', 'CourseHandler.onBeforeDelete', e.getMessage(), e.getStackTraceString());
            throw e;
        }
    }

    // Group is a setup object; deleting it in the same transaction as a Course delete
    // (non-setup DML) causes MIXED_DML_OPERATION. Running async sidesteps this.
    @future
    private static void deleteGroupsAsync(List<Id> groupIds) {
        try {
            delete [SELECT Id FROM Group WHERE Id IN :groupIds];
        } catch (Exception e) {
            ErrorLogService.log('Apex', 'CourseHandler.deleteGroupsAsync', e.getMessage(), e.getStackTraceString());
        }
    }
}
