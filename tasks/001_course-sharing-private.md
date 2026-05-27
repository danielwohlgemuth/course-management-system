# 001 Change Course sharing model to Private

**Status:** open

## What

Change `Course__c` object-level sharing from `ReadWrite` to `Private` so that records are only visible to the owner and users with explicit sharing. This is the foundation for the experience site access model where students only see courses they are enrolled in.

## Acceptance criteria

- [ ] `Course__c.object-meta.xml` has `<sharingModel>Private</sharingModel>`
- [ ] Change is deployed to the org without errors
- [ ] Existing course owners can still read and edit their own records
- [ ] Users without explicit sharing can no longer read Course records

## Notes

This change must be applied before the public group sharing triggers (tasks 007, 008) are deployed, or instructors will lose access to their own courses on deploy.

## Related migrations

- `migrations/YYYY-MM-DD_course-sharing-private.md` (add once written)
