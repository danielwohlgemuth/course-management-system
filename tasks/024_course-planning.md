# 024 Course planning feature

**Status:** open

## What

Instructors can define a course (name, classroom, number of classes per week, time per class, and semester) together with their availability (one or more day-of-week + time-range entries). Once the plan is locked, the system attempts to build a non-conflicting schedule from the declared availability. If no valid assignment exists the system surfaces a clear error rather than producing an incomplete schedule.

## Acceptance criteria

- [ ] Instructor can create a course plan with: name, classroom, classes per week, duration per class (minutes), and semester.
- [ ] Instructor can attach multiple availability windows to a course plan, each specifying day of week and a start/end time.
- [ ] An instructor can edit or delete availability windows while the plan is in "draft" status.
- [ ] A "Lock plan" action transitions the plan from draft to locked and triggers the scheduling algorithm.
- [ ] The scheduling algorithm assigns a concrete day + time slot to each required class per week, drawing only from the declared availability windows.
- [ ] If scheduling is impossible (e.g. too few available hours for the required class count), the plan stays locked-but-unscheduled and an error message is shown to the instructor.
- [ ] The generated schedule is visible to the instructor (day, start time, end time per class session).
- [ ] Locked plans cannot be edited without explicitly unlocking (reverting to draft and clearing the generated schedule).

## Notes

- New objects needed: `CoursePlan__c` (header) and `Availability__c` (child, one row per availability window).
- The scheduling algorithm can live in an Apex class invoked synchronously on lock; consider async (Queueable) if it grows complex.
- Classroom conflict detection across plans is out of scope for this task but should be kept in mind when designing the data model.
- The semester field should reuse or reference the semester identifier added in task 021.

## Related migrations

- `migrations/YYYY-MM-DD_course-plan-and-availability-objects.md` (add once written)
