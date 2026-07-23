trigger CourseTrigger on Course__c(after insert, after update, before delete) {
  if (Trigger.isAfter && Trigger.isInsert) {
    CourseHandler.onAfterInsert(Trigger.new);
  }
  if (Trigger.isAfter && Trigger.isUpdate) {
    CourseHandler.onAfterUpdate(Trigger.new, Trigger.oldMap);
  }
  if (Trigger.isBefore && Trigger.isDelete) {
    CourseHandler.onBeforeDelete(Trigger.old);
  }
}
