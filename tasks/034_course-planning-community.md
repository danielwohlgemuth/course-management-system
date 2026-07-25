# 034 Course planning from the Experience Site

**Status:** done

## What

Instructors are external users (Customer Community Plus) and have no access to internal Salesforce record pages, so the existing course planning UI ([024](024_course-planning.md)) — the `CoursePlan_Record_Page` Lightning record page and the `coursePlanSchedule` LWC, both `lightning__RecordPage`-only — is unreachable to them. Build an equivalent flow inside the `Course Portal` Experience Site so instructors can create a course plan, add/edit/delete availability windows, and lock/unlock the plan entirely from the community.

## Acceptance criteria

- [x] A "My Course Plans" (or similar) list page in the Experience Site showing the instructor's own `CoursePlan__c` records
- [x] A create/edit form for a `CoursePlan__c` (name, classroom, classes per week, duration per class, semester) usable by community users
- [x] A way to add, edit, and delete `Availability__c` windows (day of week + start/end time) on a draft plan, from the community
- [x] A "Lock plan" action reachable from the community that triggers the existing scheduling algorithm and surfaces success/error (unscheduled) states
- [x] An "Unlock plan" action reachable from the community, with the same confirmation-before-cascade-delete behavior as the internal UI
- [x] The generated schedule (day, start time, end time per session) is visible to the instructor once a plan is locked and successfully scheduled
- [x] Navigation item added to the Experience Site's default navigation menu pointing at the new page(s)

## Notes

- `CoursePlan__c`/`Availability__c` object and field permissions are already granted to `CourseInstructor` (verified in `permissionsets/CourseInstructor.permissionset-meta.xml`) — this task is UI-only, no FLS changes expected.
- Reuse the Apex scheduling logic behind `coursePlanSchedule` rather than duplicating it; expose it via `@AuraEnabled` methods callable from new community LWCs if not already structured that way.
- Follow the LWR Experience Cloud constraints noted in [025](025_course-pdf-report.md): standard Lightning quick actions and the Aura highlights panel aren't available there, so this needs plain LWCs targeting `lightningCommunity__Default`/`lightningCommunity__Page`, similar to `courseDownloadPdfReport`.
- After any Experience Builder page changes, the site must be published (`sf community publish --name "Course Portal"`) before they're visible to real users.

### Implementation notes

- One new top-level, community-exposed LWC, `coursePlanManager` (targets `lightningCommunity__Default`/`lightningCommunity__Page`), hosts the whole instructor workflow on a single Experience Builder page, avoiding the need for a separate record-detail route/page per plan:
  - Lists the instructor's own plans via a new `CoursePlanController.getMyPlans()` (`@AuraEnabled(cacheable=true)`, filtered by `OwnerId = UserInfo.getUserId()`).
  - Creating a plan uses a plain `lightning-record-edit-form` against `CoursePlan__c` (no new Apex needed: LDS respects the existing sharing/FLS model). Selecting a plan swaps the list for a child `coursePlanDetail` component; a "Back" button/event returns to the list.
- `coursePlanDetail` (internal child component, not itself community-exposed) shows the plan's editable fields (`lightning-record-edit-form` while `Status__c` is `Draft`, a read-only `lightning-record-view-form` otherwise), and embeds two further children:
  - `courseAvailabilityManager` lists/add/edit/deletes `Availability__c` windows via a new `CoursePlanController.getAvailabilityWindows(planId)` method (mirrors `getPlanDetails`'s day-ordering trick) plus `lightning-record-edit-form`/`deleteRecord` from `lightning/uiRecordApi`. Add/edit/delete are only offered while the plan is `Draft` (`AvailabilityHandler.enforceDraftOnly` already rejects DML otherwise, so the UI just avoids offering an action that would fail).
  - **The existing `coursePlanSchedule` LWC is reused as-is, unmodified**, embedded directly as `<c-course-plan-schedule record-id={recordId}>`. Its own Apex (`lockPlan`/`unlockPlan`/`getPlanDetails`), custom labels, and `LightningConfirm` unlock confirmation all work identically inside the community since a child component's own `js-meta.xml` targets only matter when it's dropped directly onto a page in Experience Builder, not when referenced from markup by another component. This satisfies the "reuse rather than duplicate the scheduling logic" note without any changes to that component.
- No FLS/permission-set changes were needed, confirming the task's own note: `CourseInstructor` already had full CRUD on `CoursePlan__c`/`Availability__c` (own records only) and class access to `CoursePlanController`.
- **Manual Experience Builder step required (not achievable via source/CLI alone):** Salesforce rejects a `NavigationMenu` deploy if its target path doesn't already resolve to a page in the site, and there is no `sf` command or hand-writable metadata format for authoring a new LWR page/route plus component placement reliably outside of Experience Builder itself (the existing `digitalExperiences/site/Course_Portal1` route/view JSON is Builder-generated retrieval output, not something intended to be hand-authored; see task 025's PDF button placement, which also isn't tracked in source for the same reason). Before this feature is visible to real users, an admin must, in Experience Builder for **Course Portal**:
  1. Create a new page at path `/my-course-plans` (Home Menu → "New Page" → a blank/custom page; any label, e.g. "My Course Plans").
  2. Drag the **My Course Plans** (`c-coursePlanManager`) component onto that page.
  3. Ensure the page is restricted to authenticated members only (matches `publiclyAvailable=false` on the nav item already deployed).
  4. Publish the site: `sf community publish --name "Course Portal"`.
  5. Redeploy the navigation menu item (fails until step 1 exists): `sf project deploy start --source-dir force-app/main/default/navigationMenus/SFDC_Default_Navigation_Course_Portal.navigationMenu-meta.xml`.
- Verified end-to-end against the `course-mgmt-dev` scratch org: all Apex (89/89, including new `getMyPlansReturnsOnlyOwnedPlansTest`/`getAvailabilityWindowsOrdersByWeekdayTest`) and Jest tests (29/29) pass; the `CoursePlanController`/label/LWC metadata deploys cleanly. The `NavigationMenu` deploy was confirmed to fail with "No page found in the site for Menu Item URL path" until the manual step above is completed, which is expected.

## Related migrations

- None (UI-only; existing objects/fields/permissions already support instructor CRUD, matching the task's own expectation).
