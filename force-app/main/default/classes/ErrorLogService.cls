public without sharing class ErrorLogService {
  public static void log(
    String sourceType,
    String sourceName,
    String message,
    String stackTrace
  ) {
    try {
      EventBus.publish(
        new Error_Logged__e(
          Source_Type__c = sourceType,
          Source_Name__c = sourceName,
          Message__c = message,
          Stack_Trace__c = stackTrace,
          User_Id__c = UserInfo.getUserId()
        )
      );
    } catch (Exception e) {
      System.debug(
        LoggingLevel.ERROR,
        'ErrorLogService.log failed: ' + e.getMessage()
      );
    }
  }

  @AuraEnabled
  public static void logFromLwc(
    String sourceName,
    String message,
    String stackTrace
  ) {
    log('LWC', sourceName, message, stackTrace);
  }

  @InvocableMethod(
    label='Log Error'
    description='Publishes an Error_Logged__e event from a Flow'
  )
  public static void logFromFlow(List<ErrorLogRequest> requests) {
    for (ErrorLogRequest req : requests) {
      log('Flow', req.sourceName, req.message, req.stackTrace);
    }
  }

  public class ErrorLogRequest {
    @InvocableVariable
    public String sourceName;
    @InvocableVariable
    public String message;
    @InvocableVariable
    public String stackTrace;
  }
}
