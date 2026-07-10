# 032 Show Owner on the Course Plan record page

**Status:** open

## What

The `CoursePlan__c` record page (`CoursePlan_Record_Page.flexipage-meta.xml`) doesn't currently surface who the plan belongs to. Add the `Owner` field so instructors and admins can see at a glance who created/owns a given plan (this is the instructor, per `CoursePlanLockService.lock`, which sets `Generated_Course__c.Instructor_User__c = plan.OwnerId`).

## Acceptance criteria

- [ ] `Owner` field is visible on the `CoursePlan__c` record page, in the detail fields section (alongside Semester/Status/Generated Course) or in the highlights panel — whichever reads more naturally next to the existing layout.
- [ ] No change to who can edit/reassign ownership — this is display-only.

## Notes

Follow-up cleanup item from task 024.

## Related migrations

None — FlexiPage layout change only, no schema change.
