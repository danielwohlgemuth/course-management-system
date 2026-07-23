trigger EnrollmentTrigger on Enrollment__c(after insert, before delete) {
  if (Trigger.isAfter && Trigger.isInsert) {
    EnrollmentHandler.onAfterInsert(Trigger.new);
  }
  if (Trigger.isBefore && Trigger.isDelete) {
    EnrollmentHandler.onBeforeDelete(Trigger.old);
  }
}
