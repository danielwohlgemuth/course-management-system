# 010 Add course calendar to Experience Site home page

**Status:** done

## What

Embed the existing course calendar LWC on the Experience Site home page. Because `Course__c` uses a Private sharing model, the calendar's standard SOQL query returns only courses that have been explicitly shared with the current user — which are exactly the courses they are enrolled in. No changes to the calendar component's query logic are needed.

## Acceptance criteria

- [ ] Course calendar LWC is added to the Experience Site home page via Experience Builder
- [ ] Logged-in students see only their enrolled courses on the calendar
- [ ] Logged-in instructors see only the courses they own on the calendar
- [ ] Calendar renders correctly on the site (styles, layout)
- [ ] No errors in the browser console when loading the page

## Notes

If the calendar LWC uses `@wire(getRecord)` or `@AuraEnabled` Apex that runs `with sharing`, it will naturally respect the Private OWD with no changes. If any controller runs `without sharing`, it must be updated before this task is considered done. Depends on task 009 for the site to exist.

## Related migrations

- (no migration needed)
