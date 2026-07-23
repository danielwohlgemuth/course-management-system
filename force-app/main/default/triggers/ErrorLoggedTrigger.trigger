trigger ErrorLoggedTrigger on Error_Logged__e(after insert) {
  List<Error_Log__c> logs = new List<Error_Log__c>();
  for (Error_Logged__e evt : Trigger.new) {
    logs.add(
      new Error_Log__c(
        Source_Type__c = evt.Source_Type__c,
        Source_Name__c = evt.Source_Name__c,
        Message__c = evt.Message__c,
        Stack_Trace__c = evt.Stack_Trace__c,
        User__c = evt.User_Id__c,
        Occurred_At__c = evt.CreatedDate
      )
    );
  }
  insert logs;
}
