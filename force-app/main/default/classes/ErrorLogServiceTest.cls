@isTest
private class ErrorLogServiceTest {

    @isTest
    static void log_insertsApexRecord() {
        Test.startTest();
        ErrorLogService.log('Apex', 'CourseHandler', 'Test error', 'Line 42');
        Test.stopTest();

        List<Error_Log__c> logs = [
            SELECT Source_Type__c, Source_Name__c, Message__c, Stack_Trace__c, User__c, Occurred_At__c
            FROM Error_Log__c
        ];
        Assert.areEqual(1, logs.size(), 'One log record should be inserted');
        Assert.areEqual('Apex', logs[0].Source_Type__c);
        Assert.areEqual('CourseHandler', logs[0].Source_Name__c);
        Assert.areEqual('Test error', logs[0].Message__c);
        Assert.areEqual('Line 42', logs[0].Stack_Trace__c);
        Assert.areEqual(UserInfo.getUserId(), logs[0].User__c);
        Assert.isNotNull(logs[0].Occurred_At__c);
    }

    @isTest
    static void logFromLwc_insertsLwcRecord() {
        Test.startTest();
        ErrorLogService.logFromLwc('courseCalendar', 'Wire error', null);
        Test.stopTest();

        List<Error_Log__c> logs = [SELECT Source_Type__c, Source_Name__c FROM Error_Log__c];
        Assert.areEqual(1, logs.size());
        Assert.areEqual('LWC', logs[0].Source_Type__c);
        Assert.areEqual('courseCalendar', logs[0].Source_Name__c);
    }

    @isTest
    static void log_handlesNullSourceTypeGracefully() {
        Test.startTest();
        ErrorLogService.log(null, null, 'something went wrong', null);
        Test.stopTest();

        // Source_Type__c is required; the PE trigger insert fails and is swallowed.
        // No exception should propagate to the caller.
        Assert.isTrue(true, 'No exception propagated from null source type');
    }

    @isTest
    static void log_capturesStackTrace() {
        String trace = 'Class.CourseHandler.onAfterInsert: line 7, column 1';
        Test.startTest();
        ErrorLogService.log('Apex', 'CourseHandler', 'DML exception', trace);
        Test.stopTest();

        Error_Log__c log = [SELECT Stack_Trace__c FROM Error_Log__c LIMIT 1];
        Assert.areEqual(trace, log.Stack_Trace__c);
    }
}
