# 022 Add Error Log and Dashboard tabs to Course Manager app

**Status:** done

## What

The Course Manager Lightning app currently only exposes the Home and Course tabs. Two important capabilities — the Error Log object (added in task 019) and the Enrollment Dashboard (added in task 020) — are not reachable from the app navigation. This task adds both as tabs in `CourseManager.app-meta.xml` so admins can access them directly from the app.

## Acceptance criteria

- [x] `Error_Log__c` tab is added to the `<tabs>` list in `CourseManager.app-meta.xml`
- [x] The Enrollment Dashboard tab (or the Dashboards standard tab) is added to the `<tabs>` list in `CourseManager.app-meta.xml`
- [x] Tab order is logical: Home → Courses → Dashboard → Error Logs
- [x] Change is deployed and both tabs are visible in the Course Manager app nav bar

## Notes

The `Error_Log__c` tab metadata already exists at `force-app/main/default/tabs/Error_Log__c.tab-meta.xml`.

The Enrollment Dashboard lives in the `EnrollmentDashboards` folder (`force-app/main/default/dashboards/EnrollmentDashboards/`). Add the standard `standard-DashboardFolder` tab or a direct dashboard tab — confirm which tab type Salesforce supports for navigating to a specific dashboard from app nav.

**Resolution:** Confirmed via `TabDefinition` (Tooling API) that the standard Dashboards tab's durable ID is `Dashboard`, so the app nav tab reference is `standard-Dashboard` (there is no `standard-DashboardFolder` tab type). This opens the standard Dashboards home tab, from which the `EnrollmentDashboards` folder is accessible; Salesforce does not support an app-nav tab that deep-links to one specific dashboard.

## Related migrations

_None required — no schema changes._
