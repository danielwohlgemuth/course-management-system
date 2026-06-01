trigger CourseTrigger on Course__c (after insert, before delete) {
    if (Trigger.isAfter && Trigger.isInsert) {
        CourseHandler.onAfterInsert(Trigger.new);
    }
    if (Trigger.isBefore && Trigger.isDelete) {
        CourseHandler.onBeforeDelete(Trigger.old);
    }
}
