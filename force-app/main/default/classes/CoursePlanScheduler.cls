/**
 * Pure scheduling algorithm for course plans: carves concrete weekly class
 * sessions out of the declared availability windows while avoiding existing
 * time slots in the same classroom and semester. No SOQL or DML.
 *
 * Placement is deterministic (windows sorted by day, start time, then Id) and
 * round-robins across days — each round places at most one session per day —
 * so classes spread over the week instead of packing into the first window.
 * Round-robin reaches the same total capacity as greedy packing for
 * fixed-duration sessions, so it never fails where packing would succeed.
 */
public inherited sharing class CoursePlanScheduler {
  public static final List<String> DAY_ORDER = new List<String>{
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  };
  public static final String ERROR_NO_AVAILABILITY_WINDOWS = Label.CoursePlanScheduler_ErrorNoAvailabilityWindows;

  public class SessionSlot {
    public String dayOfWeek;
    public Time startTime;
    public Time endTime;
  }

  public class ScheduleResult {
    public Boolean success = false;
    public List<SessionSlot> sessions = new List<SessionSlot>();
    public String errorMessage;
  }

  private class Window implements Comparable {
    Integer day;
    Integer startMin;
    Integer endMin;
    String sortKey;

    public Integer compareTo(Object other) {
      Window that = (Window) other;
      if (day != that.day)
        return day - that.day;
      if (startMin != that.startMin)
        return startMin - that.startMin;
      return sortKey.compareTo(that.sortKey);
    }
  }

  private class Interval {
    Integer startMin;
    Integer endMin;
  }

  public static ScheduleResult buildSchedule(
    Integer classesPerWeek,
    Integer durationMinutes,
    List<Availability__c> windows,
    List<TimeSlot__c> existingSlots,
    String classroom
  ) {
    ScheduleResult result = new ScheduleResult();
    if (
      classesPerWeek == null ||
      classesPerWeek < 1 ||
      durationMinutes == null ||
      durationMinutes < 1
    ) {
      result.errorMessage = Label.CoursePlanScheduler_ErrorInvalidInputs;
      return result;
    }
    if (windows == null || windows.isEmpty()) {
      result.errorMessage = ERROR_NO_AVAILABILITY_WINDOWS;
      return result;
    }

    List<Window> sorted = new List<Window>();
    Integer longestWindow = 0;
    for (Availability__c avail : windows) {
      Window w = new Window();
      w.day = dayIndex(avail.Day_of_Week__c);
      w.startMin = toMinutes(avail.Start_Time__c);
      w.endMin = toMinutes(avail.End_Time__c);
      w.sortKey = String.valueOf(avail.Id);
      if (w.endMin <= w.startMin) {
        result.errorMessage = String.format(
          Label.CoursePlanScheduler_ErrorInvalidWindow,
          new List<Object>{ avail.Day_of_Week__c }
        );
        return result;
      }
      longestWindow = Math.max(longestWindow, w.endMin - w.startMin);
      sorted.add(w);
    }
    if (longestWindow < durationMinutes) {
      result.errorMessage = String.format(
        Label.CoursePlanScheduler_ErrorWindowTooShort,
        new List<Object>{ durationMinutes }
      );
      return result;
    }
    sorted.sort();

    Map<Integer, List<Window>> windowsByDay = new Map<Integer, List<Window>>();
    List<Integer> days = new List<Integer>();
    for (Window w : sorted) {
      if (!windowsByDay.containsKey(w.day)) {
        windowsByDay.put(w.day, new List<Window>());
        days.add(w.day);
      }
      windowsByDay.get(w.day).add(w);
    }

    Map<Integer, List<Interval>> busyByDay = new Map<Integer, List<Interval>>();
    if (existingSlots != null) {
      for (TimeSlot__c slot : existingSlots) {
        Interval booked = new Interval();
        booked.startMin = toMinutes(slot.Start_Time__c);
        booked.endMin = toMinutes(slot.End_Time__c);
        Integer day = dayIndex(slot.Day_of_Week__c);
        if (!busyByDay.containsKey(day)) {
          busyByDay.put(day, new List<Interval>());
        }
        busyByDay.get(day).add(booked);
      }
    }
    Boolean hadConflicts = overlapsAnyWindow(sorted, busyByDay);

    List<SessionSlot> placed = new List<SessionSlot>();
    while (placed.size() < classesPerWeek) {
      Boolean progress = false;
      for (Integer day : days) {
        if (placed.size() == classesPerWeek)
          break;
        if (!busyByDay.containsKey(day)) {
          busyByDay.put(day, new List<Interval>());
        }
        Interval session = placeOne(
          windowsByDay.get(day),
          busyByDay.get(day),
          durationMinutes
        );
        if (session != null) {
          busyByDay.get(day).add(session);
          SessionSlot slot = new SessionSlot();
          slot.dayOfWeek = DAY_ORDER[day];
          slot.startTime = toTime(session.startMin);
          slot.endTime = toTime(session.endMin);
          placed.add(slot);
          progress = true;
        }
      }
      if (!progress)
        break;
    }

    if (placed.size() < classesPerWeek) {
      String message = String.format(
        Label.CoursePlanScheduler_ErrorPartialSchedule,
        new List<Object>{ placed.size(), classesPerWeek }
      );
      if (hadConflicts) {
        message +=
          ' ' +
          String.format(
            Label.CoursePlanScheduler_ErrorExistingConflicts,
            new List<Object>{ classroom }
          );
      }
      message += ' ' + Label.CoursePlanScheduler_ErrorUnlockPlan;
      result.errorMessage = message;
      return result;
    }

    result.success = true;
    result.sessions = placed;
    return result;
  }

  public static Integer dayIndex(String dayOfWeek) {
    return DAY_ORDER.indexOf(dayOfWeek);
  }

  // Earliest feasible start within the day's windows. Intervals are half-open
  // [start, end), so a session may begin exactly when another booking ends.
  // On conflict the candidate jumps to the end of the blocking interval —
  // no step granularity, so off-grid existing bookings are handled exactly.
  private static Interval placeOne(
    List<Window> dayWindows,
    List<Interval> busy,
    Integer durationMinutes
  ) {
    for (Window w : dayWindows) {
      Integer candidate = w.startMin;
      while (candidate + durationMinutes <= w.endMin) {
        Integer blockedUntil = null;
        for (Interval booked : busy) {
          if (
            booked.startMin < candidate + durationMinutes &&
            candidate < booked.endMin
          ) {
            blockedUntil = blockedUntil == null
              ? booked.endMin
              : Math.max(blockedUntil, booked.endMin);
          }
        }
        if (blockedUntil == null) {
          Interval session = new Interval();
          session.startMin = candidate;
          session.endMin = candidate + durationMinutes;
          return session;
        }
        candidate = blockedUntil;
      }
    }
    return null;
  }

  private static Boolean overlapsAnyWindow(
    List<Window> windows,
    Map<Integer, List<Interval>> busyByDay
  ) {
    for (Window w : windows) {
      if (!busyByDay.containsKey(w.day))
        continue;
      for (Interval booked : busyByDay.get(w.day)) {
        if (booked.startMin < w.endMin && w.startMin < booked.endMin) {
          return true;
        }
      }
    }
    return false;
  }

  private static Integer toMinutes(Time value) {
    return value.hour() * 60 + value.minute();
  }

  private static Time toTime(Integer minutes) {
    return Time.newInstance(minutes / 60, Math.mod(minutes, 60), 0, 0);
  }
}
