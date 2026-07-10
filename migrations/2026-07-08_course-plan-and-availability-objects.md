# 2026-07-08 Course Plan and Availability objects (task 024)

## What changed

- **Global value sets** (new): `Semester` (`2026 S1`), `Classroom` (Room 101–104), `Day_of_Week` (Monday–Sunday) under `force-app/main/default/globalValueSets/`. The existing inline picklists `Course__c.Semester__c`, `Course__c.Classroom__c`, and `TimeSlot__c.Day_of_Week__c` were **converted to reference these global value sets** — values are identical, so existing records keep their data.
- **`CoursePlan__c`** (new object, Private sharing, AutoNumber `CPL-{0000}`): `Course_Name__c` (Text 255, required), `Classroom__c` (picklist → GVS, required), `Classes_Per_Week__c` (Number 2,0, required), `Class_Duration_Minutes__c` (Number 3,0, required), `Semester__c` (picklist → GVS, required), `Status__c` (picklist Draft/Locked, default Draft), `Scheduling_Error__c` (Text 255), `Generated_Course__c` (Lookup → Course__c, SetNull). Validation rule `Positive_Class_Counts`. The plan **owner** is the instructor.
- **`Availability__c`** (new object, ControlledByParent, AutoNumber `AVL-{0000}`): `Course_Plan__c` (master-detail → CoursePlan__c, relationship `Availabilities`), `Day_of_Week__c` (picklist → GVS, required), `Start_Time__c`/`End_Time__c` (Time, required). Validation rule `End_After_Start`.
- **Apex** (new): `CoursePlanScheduler` (pure scheduling algorithm — deterministic round-robin, earliest-feasible-start, classroom conflict avoidance), `CoursePlanLockService` (lock/unlock orchestration, `without sharing` — generates/deletes the `Course__c` + `TimeSlot__c` records), `CoursePlanController` (`with sharing`, `WITH USER_MODE`, `@AuraEnabled lockPlan`/`unlockPlan`/`getPlanDetails`), `CoursePlanHandler` + `AvailabilityHandler` with triggers `CoursePlanTrigger` (before update/delete — locked plans are immutable, status flips only via the actions) and `AvailabilityTrigger` (before insert/update/delete — windows editable only under Draft plans). Test classes: `CoursePlanSchedulerTest`, `CoursePlanControllerTest`, `CoursePlanHandlerTest`, `AvailabilityHandlerTest`.
- **LWC** `coursePlanSchedule` (record page component): Lock/Unlock actions, generated schedule table, scheduling-error display; unlock is guarded by a confirmation dialog warning that the generated course, schedule, and enrollments are deleted.
- **UI**: `CoursePlan__c` tab; `CoursePlan_Record_Page` flexipage (fields + schedule component + Availability Windows related list); `CourseManager` app updated (new tab + View action override).
- **Permission sets — behavioral change**: **`CourseInstructor` loses create/edit/delete on `Course__c` and `TimeSlot__c` (read-only now)**; gains full CRUD on `CoursePlan__c`/`Availability__c`, access to `CoursePlanController`, and the new tab. `Course__c.Instructor_User__c` FLS is now read-only for instructors. `CourseAdmin` gains full CRUD (+ view/modify all) on both new objects, class access, and the tab. On both permission sets, `Status__c`, `Scheduling_Error__c`, and `Generated_Course__c` are FLS **read-only** — state changes go through the Lock/Unlock actions only. `CourseStudent` is unchanged. The Edit-level `Course__Share` created by `CourseHandler` is intentionally untouched — with object edit revoked it grants effective read-only access; do not "fix" it.
- **Org-portability fixes** (unblocked deploys to fresh orgs): removed the hard-coded scratch-org username from the `EnrollmentDashboards`/`EnrollmentReports` folder shares; added `enableOotbProfExtUserOpsEnable` (Setup → Digital Experiences → "Allow using standard external profiles…") to `config/project-scratch-def.json`, required by the community-user seed scripts.
- **Scripts/docs**: `scripts/update-doc-images.js` (reusable doc-screenshot orchestrator), `scripts/screenshot/course-planning.js`, `scripts/apex/seed_course_plans.apex` (re-runnable demo data), `query()` helper in `tests/helpers/salesforce.js`, registration in `scripts/update-readme-images.js`; new `docs/course-planning.md`; README + `docs/user-guide.md` updates; screenshots `assets/course-plan-{draft,schedule,error}.png`.

## Deploy steps

```bash
# 1. Global value sets (the picklist fields below reference them)
sf project deploy start --source-dir force-app/main/default/globalValueSets

# 2. Existing picklist fields converted to the global value sets
sf project deploy start \
  --source-dir force-app/main/default/objects/Course__c/fields/Semester__c.field-meta.xml \
  --source-dir force-app/main/default/objects/Course__c/fields/Classroom__c.field-meta.xml \
  --source-dir force-app/main/default/objects/TimeSlot__c/fields/Day_of_Week__c.field-meta.xml

# 3. New objects (CoursePlan__c first — Availability__c's master-detail depends on it)
sf project deploy start --source-dir force-app/main/default/objects/CoursePlan__c
sf project deploy start --source-dir force-app/main/default/objects/Availability__c

# 4. Tab (referenced by the app and permission sets)
sf project deploy start --source-dir force-app/main/default/tabs/CoursePlan__c.tab-meta.xml

# 5. Apex classes and triggers together (intra-deploy dependency resolution)
sf project deploy start --source-dir force-app/main/default/classes --source-dir force-app/main/default/triggers

# 6. LWC, then the flexipage that hosts it, then the app that references both
sf project deploy start --source-dir force-app/main/default/lwc/coursePlanSchedule
sf project deploy start --source-dir force-app/main/default/flexipages/CoursePlan_Record_Page.flexipage-meta.xml
sf project deploy start --source-dir force-app/main/default/applications/CourseManager.app-meta.xml

# 7. Permission sets LAST — this is the moment instructors lose direct Course/TimeSlot edit;
#    coordinate the rollout accordingly
sf project deploy start \
  --source-dir force-app/main/default/permissionsets/CourseInstructor.permissionset-meta.xml \
  --source-dir force-app/main/default/permissionsets/CourseAdmin.permissionset-meta.xml

# 8. Verify
sf apex run test --test-level RunLocalTests --synchronous
```

Or deploy everything at once: `sf project deploy start --source-dir force-app` (add `--ignore-conflicts` when the org has diverged and local changes should win).

## Data backfill

None required — both new objects start empty, and conflict detection automatically respects existing `Course__c`/`TimeSlot__c` records. The global-value-set conversion preserves existing picklist values (identical value names).

Optional demo/screenshot data (re-runnable; resets the two demo plans, unlocking them first):

```bash
sf apex run --file scripts/apex/seed_course_plans.apex
```

## Rollback

1. Restore the modified files and redeploy them (restores instructor Course/TimeSlot CRUD, the app nav, and the inline picklists):
   ```bash
   git checkout HEAD~1 -- \
     force-app/main/default/permissionsets \
     force-app/main/default/applications/CourseManager.app-meta.xml \
     force-app/main/default/objects/Course__c/fields/Semester__c.field-meta.xml \
     force-app/main/default/objects/Course__c/fields/Classroom__c.field-meta.xml \
     force-app/main/default/objects/TimeSlot__c/fields/Day_of_Week__c.field-meta.xml \
     scripts/update-readme-images.js README.md docs/user-guide.md
   sf project deploy start --source-dir force-app/main/default/permissionsets \
     --source-dir force-app/main/default/applications \
     --source-dir force-app/main/default/objects --ignore-conflicts
   ```
2. Delete the new metadata in reverse dependency order (Object Manager or a destructive-changes manifest): `CoursePlan_Record_Page` flexipage → `coursePlanSchedule` LWC → `CoursePlanTrigger`/`AvailabilityTrigger` → the five `CoursePlan*`/`Availability*` classes and four test classes → `CoursePlan__c` tab → `Availability__c` → `CoursePlan__c` → the three global value sets (only after step 1 restored the inline picklists).
3. Note: `Course__c` records generated from plans survive rollback as ordinary courses. Unlock any plans first if their enrollments matter — deleting a generated course cascades its time slots and enrollments.
