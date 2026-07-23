# Course Management System

A Salesforce-based application for managing courses, instructors, and weekly schedules.

## Standard Users

### Home: Weekly Calendar

The home page shows all courses in a weekly calendar view. Overlapping time slots are grouped into a stack badge; clicking it opens a popover listing each course.

![Calendar view showing overlapping courses in a popover](/assets/calendar-overlap-popover.png)

### Courses List

All courses are visible in the **All Courses** list view with course number, name, and instructor.

![All Courses list view](/assets/courses-list.png)

### Course Record

Each course record shows the course details and its related time slots.

![Biology 101 course record](/assets/biology-101-course.png)

### Course Planning

Instructors don't create courses directly. Instead, they define a **course plan** (name, classroom, classes per week, duration per class, semester) and declare their weekly availability windows. Locking the plan runs a scheduler that assigns a concrete, conflict-free time slot to each weekly class and generates the course; if no valid schedule exists, the plan stays locked with a clear error explaining why.

![Draft course plan with availability windows](/assets/course-plan-draft.png)

![Locked course plan with generated schedule](/assets/course-plan-schedule.png)

## Community Users

Community users access the app through an Experience Site with three pages: Home, Join a Course, and My Courses.

### Home

The community home page shows the full weekly course schedule as a read-only calendar.

![Community home page with weekly calendar](/assets/community-home.png)

### Join a Course

Students can browse available courses and enroll by selecting one or more from the list.

![Join a Course page showing available courses](/assets/join-a-course.png)

### My Courses

Enrolled students see their current courses in the My Courses page.

![My Courses page showing enrolled courses](/assets/my-courses.png)

## Admin Analytics

### Enrollment Dashboard

The Enrollment Dashboard shows enrollment counts per course grouped by instructor as a stacked bar chart, with supporting tables breaking down counts by instructor and by student.

![Enrollment Dashboard with stacked bar chart and tables](/assets/enrollment-dashboard.png)

### Enrollment by Instructor Report

The summary report groups enrollments first by instructor, then by course, showing a record count per course with subtotals per instructor.

![Enrollment by Instructor summary report](/assets/enrollment-report.png)
