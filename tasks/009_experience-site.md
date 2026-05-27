# 009 Create Experience Site (Build Your Own)

**Status:** open

## What

Create a Salesforce Experience Site using the "Build Your Own" template to serve as the shared portal for instructors and students. The site must be accessible to both internal users (instructors) and external users (students as community members). Permission sets `CourseInstructor` and `CourseStudent` are assigned as the site's member profiles/permission sets.

## Acceptance criteria

- [ ] Experience Site created with "Build Your Own" template
- [ ] Site is activated and accessible via its URL
- [ ] `CourseInstructor` permission set assigned to the site
- [ ] `CourseStudent` permission set assigned to the site
- [ ] Basic navigation configured (Home, Course Calendar, Join a Course, My Courses)
- [ ] Guest user access is disabled (login required)

## Notes

Navigation items for Join a Course (task 012) and My Courses (task 013) pages are placeholders until those tasks are complete. Depends on tasks 005 and 006 for the permission sets to exist.

## Related migrations

- `migrations/YYYY-MM-DD_experience-site.md` (add once written)
