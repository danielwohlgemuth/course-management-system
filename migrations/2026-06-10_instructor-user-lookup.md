# Add Instructor_User__c Lookup(User) to Course__c

## What changed

Added `Instructor_User__c` (Lookup to User) field on `Course__c`. The existing `Instructor__c` text field is left untouched. The two fields coexist until task 014 removes the text field and makes the lookup required.

## Deploy steps

```bash
sf project deploy start \
  --source-dir force-app/main/default/objects/Course__c/fields/Instructor_User__c.field-meta.xml
```

## Data backfill

Run the following Apex anonymous script after deploying. It matches each `Course__c.Instructor__c` text value against User records by email (exact match first) then by full name. Honorific/title prefixes (`Dr.`, `Prof.`, `Mr.`, `Ms.`, `Mrs.`, `Coach`) are stripped before name matching so that text values like "Dr. Elena Marsh" resolve to a User named "Elena Marsh". Unmatched values are written to the debug log for manual review.

```apex
// Strip leading honorific/title prefix, e.g. "Dr. Elena Marsh" → "Elena Marsh"
String stripPrefix(String raw) {
    if (raw == null) return null;
    String s = raw.trim();
    List<String> prefixes = new List<String>{'Dr. ', 'Prof. ', 'Mr. ', 'Ms. ', 'Mrs. ', 'Coach '};
    for (String p : prefixes) {
        if (s.startsWith(p)) {
            return s.substring(p.length()).trim();
        }
    }
    return s;
}

List<Course__c> courses = [
    SELECT Id, Instructor__c
    FROM Course__c
    WHERE Instructor__c != null AND Instructor_User__c = null
];

if (courses.isEmpty()) {
    System.debug('No courses to backfill.');
    return;
}

// Build normalised lookup sets
Set<String> rawValues = new Set<String>();
Map<String, String> rawToNorm = new Map<String, String>();
for (Course__c c : courses) {
    String raw = c.Instructor__c.trim();
    String norm = stripPrefix(raw);
    rawValues.add(raw);
    rawToNorm.put(raw, norm);
}

Set<String> normValues = new Set<String>(rawToNorm.values());

// Match by email (against raw value — unlikely but handles plain email entries)
Map<String, Id> emailToId = new Map<String, Id>();
for (User u : [SELECT Id, Email FROM User WHERE Email IN :rawValues AND IsActive = true]) {
    emailToId.put(u.Email.toLowerCase(), u.Id);
}

// Match by name (against normalised value)
Map<String, Id> nameToId = new Map<String, Id>();
for (User u : [SELECT Id, Name FROM User WHERE Name IN :normValues AND IsActive = true]) {
    nameToId.put(u.Name.toLowerCase(), u.Id);
}

List<Course__c> toUpdate = new List<Course__c>();
List<String> unmatched = new List<String>();

for (Course__c c : courses) {
    String raw = c.Instructor__c.trim();
    String norm = rawToNorm.get(raw);
    Id userId = emailToId.get(raw.toLowerCase());
    if (userId == null) {
        userId = nameToId.get(norm.toLowerCase());
    }
    if (userId != null) {
        c.Instructor_User__c = userId;
        toUpdate.add(c);
    } else {
        unmatched.add(c.Id + ' | ' + raw + ' (normalised: ' + norm + ')');
    }
}

if (!toUpdate.isEmpty()) {
    update toUpdate;
    System.debug('Updated ' + toUpdate.size() + ' courses.');
}

if (!unmatched.isEmpty()) {
    System.debug('UNMATCHED — requires manual review (' + unmatched.size() + '):');
    for (String entry : unmatched) {
        System.debug('  ' + entry);
    }
}
```

## Rollback

```bash
# Delete the field from the org
sf data delete record --sobject CustomField --where "DeveloperName='Instructor_User__c' AND TableEnumOrId='Course__c'"
# Or via Setup UI: Object Manager → Course → Fields & Relationships → Instructor (Lookup) → Delete
# Then remove the local file:
rm force-app/main/default/objects/Course__c/fields/Instructor_User__c.field-meta.xml
```
