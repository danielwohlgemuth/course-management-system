public without sharing class AvailabilityHandler {
  // Availability windows are only editable while the parent plan is a draft.
  // Validation rules can't block deletes, so all three DML events funnel here.
  public static void enforceDraftOnly(List<Availability__c> records) {
    Set<Id> planIds = new Set<Id>();
    for (Availability__c window : records) {
      planIds.add(window.Course_Plan__c);
    }
    Map<Id, CoursePlan__c> plans = new Map<Id, CoursePlan__c>(
      [SELECT Id, Status__c FROM CoursePlan__c WHERE Id IN :planIds]
    );
    for (Availability__c window : records) {
      CoursePlan__c plan = plans.get(window.Course_Plan__c);
      if (plan != null && plan.Status__c != 'Draft') {
        window.addError(
          'Availability windows can only be changed while the plan is in Draft status.'
        );
      }
    }
  }
}
