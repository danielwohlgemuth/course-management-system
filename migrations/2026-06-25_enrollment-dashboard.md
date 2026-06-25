# 2026-06-25 Enrollment Dashboard

## What changed

Added a custom report type, summary report, and dashboard visualizing enrollment counts per course grouped by instructor.

New metadata under `force-app/main/default/`:
- `reportTypes/Courses_with_Enrollments.reportType-meta.xml` — custom report type joining Course__c → Enrollment__c (outer join)
- `reports/EnrollmentReports.reportFolder-meta.xml` — shared public folder for reports
- `reports/EnrollmentReports/EnrollmentByInstructor.report-meta.xml` — summary report grouped by instructor then course number, showing enrollment record count
- `dashboards/EnrollmentDashboards.dashboardFolder-meta.xml` — shared public folder for dashboards
- `dashboards/EnrollmentDashboards/bygURZlfmlBOLgwllBuHsBiwOrIdcj.dashboard-meta.xml` — column chart of enrollment count per instructor

## Deploy steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/reportTypes/Courses_with_Enrollments.reportType-meta.xml \
  --source-dir force-app/main/default/reports/EnrollmentReports.reportFolder-meta.xml \
  --source-dir force-app/main/default/reports/EnrollmentReports \
  --source-dir force-app/main/default/dashboards/EnrollmentDashboards.dashboardFolder-meta.xml \
  --source-dir force-app/main/default/dashboards/EnrollmentDashboards
```

## Data backfill

No schema changes — no backfill needed.

## Notes on folder sharing

Salesforce metadata folder sharing (`FolderSharedToType`) does not support `PermissionSet` directly. The folders are created as shared and visible to the org admin. To grant access to the Course Admin permission set users, share the folders manually in the org UI:

1. Go to **Reports** (or **Dashboards**) tab
2. Find the **Enrollment Reports** (or **Enrollment Dashboards**) folder
3. Click the folder dropdown → **Share**
4. Add the desired users, roles, or groups

## Rollback

To remove the report and dashboard:

```bash
# Delete from org via UI (Reports tab → folder → delete report/dashboard)
# Then remove the metadata files from the repo:
rm -rf force-app/main/default/reportTypes/Courses_with_Enrollments.reportType-meta.xml
rm -rf force-app/main/default/reports/EnrollmentReports.reportFolder-meta.xml
rm -rf force-app/main/default/reports/EnrollmentReports/
rm -rf force-app/main/default/dashboards/EnrollmentDashboards.dashboardFolder-meta.xml
rm -rf force-app/main/default/dashboards/EnrollmentDashboards/
```
