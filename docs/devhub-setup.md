# Dev Hub Setup: Trailhead / Developer Edition Org

## 1. Get a free Developer Edition org

Go to https://developer.salesforce.com/signup and sign up for a **Developer Edition** org, or use an existing **Trailhead** org — both can be enabled as Dev Hubs.

Use your work email and choose a unique username (e.g. `daniel.wohlgemuth@course-mgmt.dev`).

## 2. Enable Dev Hub in the org

1. Log in to your new org at https://login.salesforce.com
2. Go to **Setup** (gear icon → Setup)
3. In the Quick Find box, search for **Dev Hub**
4. Click **Dev Hub** under Development
5. Toggle **Enable Dev Hub** to ON — confirm when prompted

> This setting is **irreversible** once enabled on a production/DE org. It's fine for a dedicated dev org.

## 3. Authorize the org with the sf CLI

```bash
sf org login web --alias course-mgmt-devhub --set-default-dev-hub
```

This opens a browser — log in with your Developer Edition credentials. The `--set-default-dev-hub` flag makes this org the default Dev Hub for all scratch org commands.

Verify it worked:

```bash
sf org list
```

You should see the org listed with `(D)` in the Dev Hub column and `(U)` as the default.

## 4. Create a scratch org

```bash
sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias course-mgmt-dev \
  --set-default \
  --duration-days 30
```

If you see `NoDefaultDevHubError`, add `--target-dev-hub` to specify the Dev Hub explicitly:

```bash
sf org create scratch \
  --definition-file config/project-scratch-def.json \
  --alias course-mgmt-dev \
  --set-default \
  --duration-days 30 \
  --target-dev-hub course-mgmt-devhub
```

Open it in a browser:

```bash
sf org open
```

## 5. Set up the Experience Site

Experience Sites and their bundles cannot be created purely via metadata deploy — the initial site must be created through Setup UI. The metadata in this repo captures the configuration of an already-created site and is used to keep it in sync.

1. Deploy all metadata except the Experience Site types first:
   ```bash
   sf project deploy start --source-dir force-app/main/default --ignore-conflicts
   ```

2. In Setup → Digital Experiences → All Sites, click **New**, choose **Build Your Own (LWR)**, set:
   - Name: `Course Portal`
   - URL: `courses` (Salesforce appends `vforcesite` automatically, giving `coursesvforcesite`)

3. Deploy the site metadata to overlay configuration and activate the site:
   ```bash
   sf project deploy start \
     --source-dir force-app/main/default/networks \
     --source-dir force-app/main/default/sites \
     --source-dir force-app/main/default/digitalExperiences \
     --source-dir force-app/main/default/navigationMenus \
     --ignore-conflicts
   ```
   The Network metadata's `<status>Live</status>` activates the site as part of this deploy, so no separate manual activation step is needed.

4. Publish the site so the deployed configuration is visible to users: open Experience Builder for `Course Portal` (Setup → Digital Experiences → All Sites → Builder) and click **Publish**, or via the CLI:
   ```bash
   sf community publish --name "Course Portal"
   ```

## Notes

- Developer Edition orgs are limited to **3 active scratch orgs** at a time (vs 40 for paid orgs).
- Scratch orgs expire after the `--duration-days` value (max 30 for DE). Delete unused ones to stay within the limit:
  ```bash
  sf org delete scratch --target-org <alias>
  ```
- Re-authorize after a session expires:
  ```bash
  sf org login web --alias course-mgmt-devhub
  ```
