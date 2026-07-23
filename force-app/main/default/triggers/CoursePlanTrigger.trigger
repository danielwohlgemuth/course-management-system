trigger CoursePlanTrigger on CoursePlan__c(before update, before delete) {
  if (Trigger.isBefore && Trigger.isUpdate) {
    CoursePlanHandler.onBeforeUpdate(Trigger.new, Trigger.oldMap);
  }
  if (Trigger.isBefore && Trigger.isDelete) {
    CoursePlanHandler.onBeforeDelete(Trigger.old);
  }
}
