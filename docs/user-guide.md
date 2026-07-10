---
title: User Guide
description: How to manage courses and view the weekly schedule calendar
last_updated: 2026-07-08
---

# User Guide

## Overview

The Course Management System lets you create courses, assign instructors, and schedule weekly time slots. A built-in calendar view displays all scheduled sessions in a colour-coded weekly grid so you can see the full schedule at a glance and spot conflicts.

---

## Opening the App

1. Click the **App Launcher** (nine-dot grid) in the top-left corner of Salesforce.
2. Search for **Course Manager** and click it.

The app opens to the **Courses** list by default. The **Home** tab shows the calendar.

---

## The Course Calendar

![Course calendar overview](../assets/calendar-overview.png)

The calendar shows every scheduled time slot across a Monday–Sunday grid. The time axis runs along the left side (7 AM–9 PM by default). Each course is assigned a distinct colour that stays consistent across all of its time slots throughout the week.

---

## Overlapping Courses

When two or more courses share the same day and overlap in time, they are grouped into a single visual strip with a **numbered badge** showing how many courses are in the group.

![Calendar with overlapping courses](../assets/calendar-overlap.png)

Click the badge to open a **popover** listing every course in the group, each with its colour swatch and name.

![Overlap popover](../assets/calendar-overlap-popover.png)

Click any item in the popover to navigate directly to that course's record.

---

## Navigating to a Course Record

- **Single card** (no overlap): click the card to open the course record.
- **Overlap group**: click the badge, then click the course name in the popover.

---

## Courses List

![Courses list view](../assets/courses-list.png)

The **Courses** tab shows all courses in a standard list view. Use the column headers to sort, or the search bar to filter by name.

---

## Course Record

![Course record page](../assets/course-record.png)

A course record displays:

| Section | Fields |
|---------|--------|
| Highlights bar | Course Number (auto-assigned), Course Name, Instructor |
| Details | Course Name, Instructor |
| Time Slots related list | All scheduled sessions — Day, Start Time, End Time |

---

## Planning a Course (Instructors)

Instructors don't create courses directly — courses are generated from a **course plan**. See [Course Planning](course-planning.md) for the full feature guide.

1. Go to the **Course Plans** tab and click **New**.
2. Fill in the plan:

| Field | Required | Description |
|-------|----------|-------------|
| Course Name | Yes | Title the generated course will carry |
| Classroom | Yes | Room the classes will be held in |
| Classes per Week | Yes | How many sessions to schedule each week |
| Duration per Class (Minutes) | Yes | Length of each session |
| Semester | Yes | Semester the course belongs to |

3. In the **Availability Windows** related list, click **New** for each weekly window you are available (day of week + start/end time). Windows are editable only while the plan is in **Draft**.
4. Click **Lock plan** in the **Schedule** card. The system assigns a concrete day and time to every weekly class, drawing only from your declared availability and avoiding other courses in the same classroom, then generates the course and its time slots.

![Draft course plan](../assets/course-plan-draft.png)

- **Success:** the schedule appears, with a link to the generated course.

  ![Generated schedule](../assets/course-plan-schedule.png)

- **No valid schedule:** the plan stays locked with an error explaining why (e.g. not enough availability for the requested classes). Unlock it, adjust the windows, and lock again.

  ![Scheduling error](../assets/course-plan-error.png)

**Unlocking:** click **Unlock plan** to revert to Draft and make changes. This deletes the generated course, its schedule, and any student enrollments — a confirmation dialog warns you first.

---

## Creating a Course (Administrators)

> Instructors can no longer create or edit courses directly — use [Planning a Course](#planning-a-course-instructors) instead.

1. Go to the **Courses** tab and click **New**.
2. Fill in the fields:

![New course form](../assets/create-course.png)

| Field | Required | Description |
|-------|----------|-------------|
| Course Name | Yes | Full title of the course (up to 255 characters) |
| Instructor | No | Name of the instructor |

3. Click **Save**. The system auto-assigns a course number (e.g. `CRS-0001`).

---

## Adding Time Slots (Administrators)

A time slot represents one recurring session per week (e.g. every Monday 9:00–10:30 AM). Add as many slots as the course needs. For courses generated from a course plan, time slots are created automatically — edit the plan (unlock, adjust, re-lock) rather than the slots.

1. Open the course record.
2. In the **Time Slots** related list, click **New**.

![New time slot form](../assets/create-time-slot.png)

| Field | Required | Description |
|-------|----------|-------------|
| Day of Week | Yes | Monday through Sunday |
| Start Time | Yes | Session start (24-hour or AM/PM format) |
| End Time | Yes | Session end |

3. Click **Save**. The slot appears in the calendar immediately.

---

## Editing and Deleting Records

**Inline edit (course record):** Click any field value on the course record page to edit it in place, then click **Save**.

**Edit a time slot:** Click the time slot row in the related list, then use the **Edit** action in the row-level menu (▼).

**Delete a time slot:** Use the **Delete** action in the row-level menu. Deleting a course deletes all of its time slots automatically.
