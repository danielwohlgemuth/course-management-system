// Assigns a role to the running admin user so they can own portal Accounts.
// Required once per scratch org before creating Community users.
//
// NOTE: Apex DML on User.UserRoleId returns INVALID_CROSS_REFERENCE_KEY in scratch orgs
// for the pre-existing sample roles. Use the shell script instead:
//
//   scripts/setup/assign_admin_role.sh
//
// That script creates a fresh "Administrator" role via the REST API and assigns it,
// which works around the restriction.
