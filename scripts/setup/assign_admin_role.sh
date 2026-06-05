#!/usr/bin/env bash
# Assigns an "Administrator" role to the default org's admin user.
# Required once per scratch org so the admin can own portal Accounts
# (a Salesforce prerequisite for any Customer Community user).
#
# Background: Apex DML and sf data update both return INVALID_CROSS_REFERENCE_KEY
# when assigning the pre-existing sample roles to this user in a scratch org.
# Creating a new role via the REST API and assigning it works around the restriction.
#
# Usage: bash scripts/setup/assign_admin_role.sh

set -euo pipefail

INSTANCE_URL=$(sf org display --json | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['instanceUrl'])")
TOKEN=$(sf org auth show-access-token --json | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['accessToken'])")
ADMIN_ID=$(sf data query --query "SELECT Id FROM User WHERE Username = '$(sf org display --json | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['username'])")' LIMIT 1" --json | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['records'][0]['Id'])")

echo "Org:   $INSTANCE_URL"
echo "Admin: $ADMIN_ID"

# Check if the admin already has a role
EXISTING=$(sf data query --query "SELECT UserRoleId FROM User WHERE Id = '$ADMIN_ID'" --json | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['records'][0]['UserRoleId'] or '')")
if [ -n "$EXISTING" ]; then
  echo "Role already assigned ($EXISTING) — nothing to do."
  exit 0
fi

# Create a new role (fresh roles can be assigned; pre-existing sample roles cannot)
ROLE_ID=$(curl -sf -X POST "$INSTANCE_URL/services/data/v66.0/sobjects/UserRole" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"Name":"Administrator","DeveloperName":"Administrator"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo "Created role: $ROLE_ID"

# Assign the role to the admin user
curl -sf -X PATCH "$INSTANCE_URL/services/data/v66.0/sobjects/User/$ADMIN_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"UserRoleId\": \"$ROLE_ID\"}"

echo "Role assigned to $ADMIN_ID."
