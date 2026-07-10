public without sharing class CoursePlanHandler {
    // Set only by CoursePlanLockService around its own status writes; every
    // other path (UI, API, anonymous Apex) goes through the checks below.
    public static Boolean bypassLockEnforcement = false;

    public static void onBeforeUpdate(List<CoursePlan__c> newPlans, Map<Id, CoursePlan__c> oldMap) {
        if (bypassLockEnforcement) {
            return;
        }
        for (CoursePlan__c plan : newPlans) {
            CoursePlan__c old = oldMap.get(plan.Id);
            if (old.Status__c == 'Locked') {
                plan.addError('This plan is locked. Use the Unlock action to make changes.');
            } else if (plan.Status__c == 'Locked') {
                plan.addError('Use the Lock Plan action to lock this plan.');
            } else if (plan.Scheduling_Error__c != old.Scheduling_Error__c ||
                plan.Generated_Course__c != old.Generated_Course__c) {
                plan.addError('Scheduling Error and Generated Course are managed by the Lock Plan action.');
            }
        }
    }

    public static void onBeforeDelete(List<CoursePlan__c> oldPlans) {
        for (CoursePlan__c plan : oldPlans) {
            if (plan.Status__c == 'Locked') {
                plan.addError('Unlock the plan before deleting it.');
            }
        }
    }
}
