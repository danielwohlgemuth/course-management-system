public without sharing class CoursePlanHandler {
  // Set only by CoursePlanLockService around its own status writes; every
  // other path (UI, API, anonymous Apex) goes through the checks below.
  public static Boolean bypassLockEnforcement = false;

  public static final String ERROR_EDIT_LOCKED_PLAN = 'This plan is locked. Use the Unlock action to make changes.';
  public static final String ERROR_MANUAL_LOCK = 'Use the Lock Plan action to lock this plan.';
  public static final String ERROR_SYSTEM_FIELDS_MANAGED = 'Scheduling Error and Generated Course are managed by the Lock Plan action.';

  public static void onBeforeUpdate(
    List<CoursePlan__c> newPlans,
    Map<Id, CoursePlan__c> oldMap
  ) {
    if (bypassLockEnforcement) {
      return;
    }
    for (CoursePlan__c plan : newPlans) {
      CoursePlan__c old = oldMap.get(plan.Id);
      if (old.Status__c == CoursePlanLockService.STATUS_LOCKED) {
        plan.addError(ERROR_EDIT_LOCKED_PLAN);
      } else if (plan.Status__c == CoursePlanLockService.STATUS_LOCKED) {
        plan.addError(ERROR_MANUAL_LOCK);
      } else if (
        plan.Scheduling_Error__c != old.Scheduling_Error__c ||
        plan.Generated_Course__c != old.Generated_Course__c
      ) {
        plan.addError(ERROR_SYSTEM_FIELDS_MANAGED);
      }
    }
  }
}
