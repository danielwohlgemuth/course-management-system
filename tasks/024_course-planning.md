# 024 Course planning feature

**Status:** done

## What

Instructors can define a course (name, classroom, number of classes per week, time per class, and semester) together with their availability (one or more day-of-week + time-range entries). Once the plan is locked, the system attempts to build a non-conflicting schedule from the declared availability. If no valid assignment exists the system surfaces a clear error rather than producing an incomplete schedule.

## Acceptance criteria

- [x] Instructor can create a course plan with: name, classroom, classes per week, duration per class (minutes), and semester.
- [x] Instructor can attach multiple availability windows to a course plan, each specifying day of week and a start/end time.
- [x] An instructor can edit or delete availability windows while the plan is in "draft" status.
- [x] A "Lock plan" action transitions the plan from draft to locked and triggers the scheduling algorithm.
- [x] The scheduling algorithm assigns a concrete day + time slot to each required class per week, drawing only from the declared availability windows.
- [x] If scheduling is impossible (e.g. too few available hours for the required class count), the plan stays locked-but-unscheduled and an error message is shown to the instructor.
- [x] The generated schedule is visible to the instructor (day, start time, end time per class session).
- [x] Locked plans cannot be edited without explicitly unlocking (reverting to draft and clearing the generated schedule).

## Notes

- New objects needed: `CoursePlan__c` (header) and `Availability__c` (child, one row per availability window).
- The scheduling algorithm can live in an Apex class invoked synchronously on lock; consider async (Queueable) if it grows complex.
- Classroom conflict detection across plans should be kept in mind when designing the data model.
- The semester field should reuse or reference the semester identifier added in task 021.

Implementation decisions (clarified during the task):

- A `Course__c` record (with its `TimeSlot__c` children) is **generated** from a successfully scheduled plan; the plan links to it via `Generated_Course__c`.
- Instructors can no longer modify courses or time slots directly — the `CourseInstructor` permission set is read-only on `Course__c`/`TimeSlot__c`; courses come only from locking plans.
- Unlock is always allowed, guarded by a confirmation dialog: it deletes the generated course, its schedule, and any student enrollments (master-detail cascade).
- `Semester`, `Classroom`, and `Day of Week` were promoted to **Global Value Sets** shared by `Course__c`, `TimeSlot__c`, `CoursePlan__c`, and `Availability__c`.
- Feature docs: `docs/course-planning.md`; screenshots regenerate via the reusable `scripts/update-doc-images.js` + `scripts/screenshot/course-planning.js` (seed with `scripts/apex/seed_course_plans.apex`).

## Related migrations

- `migrations/2026-07-08_course-plan-and-availability-objects.md`
