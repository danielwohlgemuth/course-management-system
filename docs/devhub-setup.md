# Dev Hub Setup: Trailhead / Developer Edition Org

## 1. Get a free Developer Edition org

Go to https://developer.salesforce.com/signup and sign up for a **Developer Edition** org (not a Trailhead Playground — Playgrounds can't be enabled as Dev Hubs).

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

Open it in a browser:

```bash
sf org open
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
