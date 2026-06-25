# 020 Enrollment dashboard: students per course grouped by instructor

**Status:** done

## What

Build a Salesforce report and dashboard that shows how many students are enrolled in each course, with courses grouped by instructor. This gives administrators and instructors a quick view of enrollment load across the course catalog.

## Acceptance criteria

- [x] A custom report type (or use the existing `Course__c` with `Enrollment__c` child relationship) that joins courses with their enrollment count
- [x] A summary report with rows grouped first by `Instructor_User__c` (instructor name) and then by `Course__c` (course number + name), showing a `COUNT` of `Enrollment__c` records per course
- [x] A dashboard with at least one component (bar chart or table) visualizing enrollment counts per course, with instructor as the grouping/color dimension
- [x] Report and dashboard are stored in a shared folder accessible to the Course Admin permission set (folders are shared; permission-set-level sharing requires manual configuration — see migration notes)
- [x] Metadata for the report, dashboard, and report type (if custom) is committed under `force-app/main/default/` and deployable via `sf project deploy start`

## Notes

Salesforce report and dashboard metadata can be retrieved with:
```bash
sf project retrieve start --metadata Report:FolderName/ReportName
sf project retrieve start --metadata Dashboard:FolderName/DashboardName
```
Create the report and dashboard in the org UI first, then retrieve the metadata.

**Folder API names:**
- Report folder: `EnrollmentReports`
- Dashboard folder: `EnrollmentDashboards`
- Dashboard API name: `EnrollmentDashboards/bygURZlfmlBOLgwllBuHsBiwOrIdcj`

**Migration:** [2026-06-25_enrollment-dashboard.md](../migrations/2026-06-25_enrollment-dashboard.md)
