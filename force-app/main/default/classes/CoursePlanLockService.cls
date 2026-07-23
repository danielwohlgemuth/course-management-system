/**
 * Locks and unlocks course plans. Runs without sharing and with system-mode
 * DML on purpose:
 *  - conflict detection must see every course's time slots in the target
 *    classroom, not just those shared with the running instructor;
 *  - instructors have no create/edit/delete on Course__c/TimeSlot__c — the
 *    generated course can only come into existence through this service.
 */
public without sharing class CoursePlanLockService {
  public static final String STATUS_DRAFT = 'Draft';
  public static final String STATUS_LOCKED = 'Locked';
  public static final String ERROR_ALREADY_LOCKED = 'This plan is already locked.';
  public static final String ERROR_NOT_LOCKED = 'This plan is not locked.';

  public class CoursePlanLockException extends Exception {
  }

  /**
   * Draft -> Locked. Runs the scheduler; on success generates the Course and
   * its TimeSlots, on scheduling failure stores the error on the plan and
   * leaves it locked-but-unscheduled. Scheduling failure is a domain outcome,
   * not an exception — throwing would roll back the very status write that
   * "locked-but-unscheduled" requires.
   */
  public static CoursePlan__c lock(Id planId) {
    // FOR UPDATE serializes concurrent lock attempts on the same plan.
    CoursePlan__c plan = [
      SELECT
        Id,
        OwnerId,
        Course_Name__c,
        Classroom__c,
        Semester__c,
        Classes_Per_Week__c,
        Class_Duration_Minutes__c,
        Status__c
      FROM CoursePlan__c
      WHERE Id = :planId
      FOR UPDATE
    ];
    if (plan.Status__c != STATUS_DRAFT) {
      throw new CoursePlanLockException(ERROR_ALREADY_LOCKED);
    }

    // Contend on the classroom's existing courses so two plans locking the
    // same room serialize and the second sees the first's new time slots.
    // A classroom with no courses yet has no row to contend on; that
    // first-two-plans race is a documented, accepted limitation.
    List<Course__c> sameRoomCourses = [
      SELECT Id
      FROM Course__c
      WHERE
        Classroom__c = :plan.Classroom__c
        AND Semester__c = :plan.Semester__c
      FOR UPDATE
    ];
    List<TimeSlot__c> existingSlots = [
      SELECT Day_of_Week__c, Start_Time__c, End_Time__c
      FROM TimeSlot__c
      WHERE Course__c IN :sameRoomCourses
    ];
    List<Availability__c> windows = [
      SELECT Id, Day_of_Week__c, Start_Time__c, End_Time__c
      FROM Availability__c
      WHERE Course_Plan__c = :plan.Id
    ];

    CoursePlanScheduler.ScheduleResult schedule = CoursePlanScheduler.buildSchedule(
      (Integer) plan.Classes_Per_Week__c,
      (Integer) plan.Class_Duration_Minutes__c,
      windows,
      existingSlots,
      plan.Classroom__c
    );

    try {
      if (schedule.success) {
        Course__c course = new Course__c(
          Course_Name__c = plan.Course_Name__c,
          Instructor_User__c = plan.OwnerId,
          Semester__c = plan.Semester__c,
          Classroom__c = plan.Classroom__c
        );
        insert course; // CourseTrigger creates the public group and shares

        List<TimeSlot__c> slots = new List<TimeSlot__c>();
        for (CoursePlanScheduler.SessionSlot session : schedule.sessions) {
          slots.add(
            new TimeSlot__c(
              Course__c = course.Id,
              Day_of_Week__c = session.dayOfWeek,
              Start_Time__c = session.startTime,
              End_Time__c = session.endTime
            )
          );
        }
        insert slots;

        plan.Status__c = STATUS_LOCKED;
        plan.Generated_Course__c = course.Id;
        plan.Scheduling_Error__c = null;
      } else {
        plan.Status__c = STATUS_LOCKED;
        plan.Generated_Course__c = null;
        plan.Scheduling_Error__c = schedule.errorMessage.abbreviate(255);
      }
      updatePlanBypassingLockEnforcement(plan);
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'CoursePlanLockService.lock',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw e;
    }
    return plan;
  }

  /**
   * Locked -> Draft. Deletes the generated course, which cascades its
   * TimeSlots and Enrollments (the UI warns before calling this) and cleans
   * up the course's public group via CourseHandler's async delete.
   */
  public static CoursePlan__c unlock(Id planId) {
    CoursePlan__c plan = [
      SELECT Id, Status__c, Generated_Course__c
      FROM CoursePlan__c
      WHERE Id = :planId
      FOR UPDATE
    ];
    if (plan.Status__c != STATUS_LOCKED) {
      throw new CoursePlanLockException(ERROR_NOT_LOCKED);
    }

    try {
      if (plan.Generated_Course__c != null) {
        delete [SELECT Id FROM Course__c WHERE Id = :plan.Generated_Course__c];
      }
      plan.Status__c = STATUS_DRAFT;
      plan.Generated_Course__c = null;
      plan.Scheduling_Error__c = null;
      updatePlanBypassingLockEnforcement(plan);
    } catch (Exception e) {
      ErrorLogService.log(
        'Apex',
        'CoursePlanLockService.unlock',
        e.getMessage(),
        e.getStackTraceString()
      );
      throw e;
    }
    return plan;
  }

  private static void updatePlanBypassingLockEnforcement(CoursePlan__c plan) {
    CoursePlanHandler.bypassLockEnforcement = true;
    try {
      update plan;
    } finally {
      CoursePlanHandler.bypassLockEnforcement = false;
    }
  }
}
