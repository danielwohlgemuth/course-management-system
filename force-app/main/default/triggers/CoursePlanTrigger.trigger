trigger CoursePlanTrigger on CoursePlan__c(before update) {
  if (Trigger.isBefore && Trigger.isUpdate) {
    CoursePlanHandler.onBeforeUpdate(Trigger.new, Trigger.oldMap);
  }
}
