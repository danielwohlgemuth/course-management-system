# 020 Enrollment dashboard: students per course grouped by instructor

**Status:** open

## What

Build a Salesforce report and dashboard that shows how many students are enrolled in each course, with courses grouped by instructor. This gives administrators and instructors a quick view of enrollment load across the course catalog.

## Acceptance criteria

- [ ] A custom report type (or use the existing `Course__c` with `Enrollment__c` child relationship) that joins courses with their enrollment count
- [ ] A summary report with rows grouped first by `Instructor_User__c` (instructor name) and then by `Course__c` (course number + name), showing a `COUNT` of `Enrollment__c` records per course
- [ ] A dashboard with at least one component (bar chart or table) visualizing enrollment counts per course, with instructor as the grouping/color dimension
- [ ] Report and dashboard are stored in a shared folder accessible to the Course Admin permission set
- [ ] Metadata for the report, dashboard, and report type (if custom) is committed under `force-app/main/default/` and deployable via `sf project deploy start`

## Notes

Salesforce report and dashboard metadata can be retrieved with:
```bash
sf project retrieve start --metadata Report:FolderName/ReportName
sf project retrieve start --metadata Dashboard:FolderName/DashboardName
```
Create the report and dashboard in the org UI first, then retrieve the metadata. Link the folder API names here once known.
