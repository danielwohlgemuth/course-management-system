# 2026-06-03 Experience Site — Course Portal

## What changed

- **Network** (`Course Portal`) — LWR Experience Site with `CourseInstructor` and `CourseStudent` permission sets as members, guest access disabled, URL prefix `coursesvforcesite`.
- **CustomSite** (`Course_Portal`) — underlying site record.
- **DigitalExperienceBundle** (`Course_Portal1`) — "Build Your Own" LWR bundle including routes (Home, Login, Register, Forgot Password, Check Password, Error, Too Many Requests), views, theme, branding, and styles.
- **NavigationMenu** (`SFDC_Default_Navigation_Course_Portal`) — default navigation with Course Calendar, Join a Course, and My Courses items (login-required; targets are placeholders until tasks 012 and 013 are complete).

## Deploy steps

Experience Sites and their bundles cannot be created purely via metadata deploy — the initial site must be created through Setup UI. The metadata in this repo captures the configuration of an already-created site and is used to keep it in sync.

### Fresh scratch org

1. Create a scratch org with Communities enabled:
   ```bash
   sf org create scratch --definition-file config/project-scratch-def.json --alias course-dev --duration-days 30
   ```
   Ensure `config/project-scratch-def.json` includes:
   ```json
   { "features": ["Communities"] }
   ```

2. Deploy all metadata except the Experience Site types first:
   ```bash
   sf project deploy start --source-dir force-app/main/default --ignore-conflicts
   ```

3. In Setup → Digital Experiences → All Sites, click **New**, choose **Build Your Own (LWR)**, set:
   - Name: `Course Portal`
   - URL: `coursesvforcesite`

4. Activate the site (click **Activate** in Experience Builder or via the All Sites list).

5. Deploy the site metadata to overlay configuration:
   ```bash
   sf project deploy start \
     --source-dir force-app/main/default/networks \
     --source-dir force-app/main/default/sites \
     --source-dir force-app/main/default/digitalExperiences \
     --source-dir force-app/main/default/navigationMenus \
     --ignore-conflicts
   ```

## Data backfill

None required. Member groups (`CourseInstructor`, `CourseStudent`) are applied via the Network metadata deploy.

## Rollback

Delete the site in Setup → Digital Experiences → All Sites, then remove the metadata files:
- `force-app/main/default/networks/`
- `force-app/main/default/sites/`
- `force-app/main/default/digitalExperiences/`
- `force-app/main/default/navigationMenus/`
