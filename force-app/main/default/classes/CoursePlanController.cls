public with sharing class CoursePlanController {
  public static final String ERROR_NO_ACCESS = Label.CoursePlanController_ErrorNoAccess;

  public class LockResult {
    @AuraEnabled
    public Boolean scheduled;
    @AuraEnabled
    public String errorMessage;
    @AuraEnabled
    public Id courseId;
  }

  public class PlanDetails {
    @AuraEnabled
    public List<TimeSlot__c> sessions;
    @AuraEnabled
    public Integer enrollmentCount;
  }

  @AuraEnabled
  public static LockResult lockPlan(Id planId) {
    try {
      assertCanManage(planId);
      CoursePlan__c plan = CoursePlanLockService.lock(planId);
      LockResult result = new LockResult();
      result.scheduled = plan.Generated_Course__c != null;
      result.errorMessage = plan.Scheduling_Error__c;
      result.courseId = plan.Generated_Course__c;
      return result;
    } catch (AuraHandledException e) {
      throw e;
    } catch (CoursePlanLockService.CoursePlanLockException e) {
      throw auraError(e.getMessage());
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'CoursePlanController.lockPlan',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw auraError(e.getMessage());
    }
  }

  @AuraEnabled
  public static void unlockPlan(Id planId) {
    try {
      assertCanManage(planId);
      CoursePlanLockService.unlock(planId);
    } catch (AuraHandledException e) {
      throw e;
    } catch (CoursePlanLockService.CoursePlanLockException e) {
      throw auraError(e.getMessage());
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'CoursePlanController.unlockPlan',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw auraError(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<CoursePlan__c> getMyPlans() {
    try {
      return [
        SELECT Id, Name, Course_Name__c, Classroom__c, Semester__c, Status__c
        FROM CoursePlan__c
        WHERE OwnerId = :UserInfo.getUserId()
        WITH USER_MODE
        ORDER BY CreatedDate DESC
      ];
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'CoursePlanController.getMyPlans',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw auraError(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static List<Availability__c> getAvailabilityWindows(Id planId) {
    try {
      List<Availability__c> windows = [
        SELECT Id, Day_of_Week__c, Start_Time__c, End_Time__c
        FROM Availability__c
        WHERE Course_Plan__c = :planId
        WITH USER_MODE
        ORDER BY Start_Time__c
      ];
      // SOQL can't order by weekday semantics; group the time-ordered rows by day
      List<Availability__c> ordered = new List<Availability__c>();
      for (String day : CoursePlanScheduler.DAY_ORDER) {
        for (Availability__c window : windows) {
          if (window.Day_of_Week__c == day) {
            ordered.add(window);
          }
        }
      }
      return ordered;
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'CoursePlanController.getAvailabilityWindows',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw auraError(e.getMessage());
    }
  }

  @AuraEnabled(cacheable=true)
  public static PlanDetails getPlanDetails(Id planId) {
    try {
      PlanDetails details = new PlanDetails();
      details.sessions = new List<TimeSlot__c>();
      details.enrollmentCount = 0;

      List<CoursePlan__c> plans = [
        SELECT Generated_Course__c
        FROM CoursePlan__c
        WHERE Id = :planId
        WITH USER_MODE
      ];
      if (plans.isEmpty() || plans[0].Generated_Course__c == null) {
        return details;
      }
      Id courseId = plans[0].Generated_Course__c;
      List<TimeSlot__c> slots = [
        SELECT Id, Day_of_Week__c, Start_Time__c, End_Time__c
        FROM TimeSlot__c
        WHERE Course__c = :courseId
        WITH USER_MODE
        ORDER BY Start_Time__c
      ];
      // SOQL can't order by weekday semantics; group the time-ordered rows by day
      for (String day : CoursePlanScheduler.DAY_ORDER) {
        for (TimeSlot__c slot : slots) {
          if (slot.Day_of_Week__c == day) {
            details.sessions.add(slot);
          }
        }
      }
      details.enrollmentCount = [
        SELECT COUNT()
        FROM Enrollment__c
        WHERE Course__c = :courseId
        WITH USER_MODE
      ];
      return details;
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'CoursePlanController.getPlanDetails',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw auraError(e.getMessage());
    }
  }

  // Row-level authorization: CoursePlan__c is Private, so a USER_MODE query
  // returning the row means the caller is the owner or an admin with view/modify all.
  private static void assertCanManage(Id planId) {
    List<CoursePlan__c> visible = [
      SELECT Id
      FROM CoursePlan__c
      WHERE Id = :planId
      WITH USER_MODE
    ];
    if (visible.isEmpty()) {
      throw auraError(ERROR_NO_ACCESS);
    }
  }

  // AuraHandledException.getMessage() returns 'Script-thrown exception'
  // unless setMessage is called; set it so logs and tests see the real text.
  private static AuraHandledException auraError(String message) {
    AuraHandledException error = new AuraHandledException(message);
    error.setMessage(message);
    return error;
  }
}
