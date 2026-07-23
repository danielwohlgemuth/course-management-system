public without sharing class EnrollmentHandler {
  public static void onAfterInsert(List<Enrollment__c> newEnrollments) {
    try {
      Set<Id> courseIds = new Set<Id>();
      for (Enrollment__c e : newEnrollments) {
        if (e.Course__c != null && e.Student__c != null) {
          courseIds.add(e.Course__c);
        }
      }
      if (courseIds.isEmpty())
        return;

      Map<Id, Id> courseToGroup = new Map<Id, Id>();
      for (Course__c c : [
        SELECT Id, Public_Group_Id__c
        FROM Course__c
        WHERE Id IN :courseIds AND Public_Group_Id__c != NULL
      ]) {
        courseToGroup.put(c.Id, c.Public_Group_Id__c);
      }

      List<Id> userIds = new List<Id>();
      List<Id> groupIds = new List<Id>();
      for (Enrollment__c e : newEnrollments) {
        Id groupId = courseToGroup.get(e.Course__c);
        if (groupId != null) {
          userIds.add(e.Student__c);
          groupIds.add(groupId);
        }
      }
      if (!userIds.isEmpty()) {
        addGroupMembersAsync(userIds, groupIds);
      }
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'EnrollmentHandler.onAfterInsert',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw e;
    }
  }

  public static void onBeforeDelete(List<Enrollment__c> oldEnrollments) {
    try {
      Set<Id> courseIds = new Set<Id>();
      for (Enrollment__c e : oldEnrollments) {
        if (e.Course__c != null && e.Student__c != null) {
          courseIds.add(e.Course__c);
        }
      }
      if (courseIds.isEmpty())
        return;

      Map<Id, Id> courseToGroup = new Map<Id, Id>();
      for (Course__c c : [
        SELECT Id, Public_Group_Id__c
        FROM Course__c
        WHERE Id IN :courseIds AND Public_Group_Id__c != NULL
      ]) {
        courseToGroup.put(c.Id, c.Public_Group_Id__c);
      }

      List<Id> userIds = new List<Id>();
      List<Id> groupIds = new List<Id>();
      for (Enrollment__c e : oldEnrollments) {
        Id groupId = courseToGroup.get(e.Course__c);
        if (groupId != null) {
          userIds.add(e.Student__c);
          groupIds.add(groupId);
        }
      }
      if (!userIds.isEmpty()) {
        removeGroupMembersAsync(userIds, groupIds);
      }
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'EnrollmentHandler.onBeforeDelete',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw e;
    }
  }

  // GroupMember is a setup object; inserting it in the same transaction as Enrollment DML
  // (non-setup) causes MIXED_DML_OPERATION. Running async sidesteps this.
  @future
  private static void addGroupMembersAsync(
    List<Id> userIds,
    List<Id> groupIds
  ) {
    try {
      List<GroupMember> members = new List<GroupMember>();
      for (Integer i = 0; i < userIds.size(); i++) {
        members.add(
          new GroupMember(UserOrGroupId = userIds[i], GroupId = groupIds[i])
        );
      }
      insert members;
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'EnrollmentHandler.addGroupMembersAsync',
        e.getMessage(),
        e.getStackTraceString()
      );
    }
  }

  @future
  private static void removeGroupMembersAsync(
    List<Id> userIds,
    List<Id> groupIds
  ) {
    try {
      Set<String> pairKeys = new Set<String>();
      Set<Id> groupIdSet = new Set<Id>();
      Set<Id> userIdSet = new Set<Id>();
      for (Integer i = 0; i < userIds.size(); i++) {
        pairKeys.add(groupIds[i] + '_' + userIds[i]);
        groupIdSet.add(groupIds[i]);
        userIdSet.add(userIds[i]);
      }
      List<GroupMember> toDelete = new List<GroupMember>();
      for (GroupMember gm : [
        SELECT Id, GroupId, UserOrGroupId
        FROM GroupMember
        WHERE GroupId IN :groupIdSet AND UserOrGroupId IN :userIdSet
      ]) {
        if (pairKeys.contains(gm.GroupId + '_' + gm.UserOrGroupId)) {
          toDelete.add(gm);
        }
      }
      if (!toDelete.isEmpty()) {
        delete toDelete;
      }
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'EnrollmentHandler.removeGroupMembersAsync',
        e.getMessage(),
        e.getStackTraceString()
      );
    }
  }
}
