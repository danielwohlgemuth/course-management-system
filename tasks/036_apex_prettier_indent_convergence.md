# 036 Reformat remaining Apex classes to prettier's 2-space indent

**Status:** done

## What

The pre-commit hook (`husky` + `lint-staged`) was silently broken: `eslint.config.js` used CommonJS `require()` while `package.json` declares `"type": "module"`, so ESLint crashed before `prettier --write` ever ran on a real commit. `prettier-plugin-apex` has therefore never actually formatted a committed `.cls` file, and the whole codebase is hand-written at 4-space indentation.

Task 028 fixed the ESLint config (converted it to ES module imports), which unblocked the hook. Prettier's default 2-space indent then applied to the `.cls` files touched by that commit (`CoursePlanController.cls`, `CoursePlanControllerTest.cls`, `CoursePlanHandler.cls`, `CoursePlanHandlerTest.cls`, `CoursePlanLockService.cls`, `CoursePlanScheduler.cls`), while every other `.cls` file in the repo remains 4-space. The codebase is now inconsistently indented, and every future commit will silently reformat whatever `.cls` files it touches to 2-space.

Reformat the rest of the Apex classes (and any Apex triggers) to 2-space indentation via `npx prettier --write "force-app/**/*.{cls,trigger}"` so the whole codebase converges on prettier's formatting, in one dedicated commit with no other changes mixed in.

## Acceptance criteria

- [x] `npx prettier --check "force-app/**/*.{cls,trigger}"` passes with no diffs.
- [x] The reformatting commit contains only whitespace/formatting changes (no logic changes).
- [x] `sf apex run test --test-level RunLocalTests --synchronous` passes after the reformat.

## Notes

Follow-up from task 028, where fixing `eslint.config.js` exposed this latent formatting drift.

## Related migrations

None, no schema change.
