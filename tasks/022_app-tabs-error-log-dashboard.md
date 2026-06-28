# 022 Add Error Log and Dashboard tabs to Course Manager app

**Status:** open

## What

The Course Manager Lightning app currently only exposes the Home and Course tabs. Two important capabilities — the Error Log object (added in task 019) and the Enrollment Dashboard (added in task 020) — are not reachable from the app navigation. This task adds both as tabs in `CourseManager.app-meta.xml` so admins can access them directly from the app.

## Acceptance criteria

- [ ] `Error_Log__c` tab is added to the `<tabs>` list in `CourseManager.app-meta.xml`
- [ ] The Enrollment Dashboard tab (or the Dashboards standard tab) is added to the `<tabs>` list in `CourseManager.app-meta.xml`
- [ ] Tab order is logical: Home → Courses → Dashboard → Error Logs
- [ ] Change is deployed and both tabs are visible in the Course Manager app nav bar

## Notes

The `Error_Log__c` tab metadata already exists at `force-app/main/default/tabs/Error_Log__c.tab-meta.xml`.

The Enrollment Dashboard lives in the `EnrollmentDashboards` folder (`force-app/main/default/dashboards/EnrollmentDashboards/`). Add the standard `standard-DashboardFolder` tab or a direct dashboard tab — confirm which tab type Salesforce supports for navigating to a specific dashboard from app nav.

## Related migrations

_None required — no schema changes._
