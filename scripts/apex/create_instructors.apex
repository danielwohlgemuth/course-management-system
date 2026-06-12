// Creates Customer Community Plus Users for all 5 course instructors.
// Run via: sf apex run --file scripts/apex/create_instructors.apex
//
// Next step: assign the CourseInstructor permission set by running:
//   sf apex run --file scripts/apex/assign_instructor_permission_set.apex

Account acct = new Account(Name = 'Course Management');
insert acct;

List<String> firstNames = new List<String>{'Elena',      'James',       'Priya',     'Sandra',     'Carlos'};
List<String> lastNames  = new List<String>{'Marsh',      'Okafor',      'Nair',       'Voss',       'Rivera'};
List<String> aliases    = new List<String>{'emarsh',     'jokafor',     'pnair',      'svoss',      'crivera'};
List<String> nicknames  = new List<String>{'ElenaMarsh', 'JamesOkafor', 'PriyaNair',  'SandraVoss', 'CarlosRivera'};

List<Contact> contacts = new List<Contact>();
for (Integer i = 0; i < firstNames.size(); i++) {
    contacts.add(new Contact(
        FirstName = firstNames[i],
        LastName  = lastNames[i],
        Email     = aliases[i] + '@coursemgmt.example.com.invalid',
        AccountId = acct.Id
    ));
}
insert contacts;

Id profileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community Plus User' LIMIT 1].Id;

List<User> users = new List<User>();
for (Integer i = 0; i < firstNames.size(); i++) {
    users.add(new User(
        FirstName         = firstNames[i],
        LastName          = lastNames[i],
        Email             = aliases[i] + '@coursemgmt.example.com.invalid',
        Username          = aliases[i] + '@coursemgmt.example.com.cmscratch',
        Alias             = aliases[i],
        CommunityNickname = nicknames[i],
        TimeZoneSidKey    = 'America/Los_Angeles',
        LocaleSidKey      = 'en_US',
        EmailEncodingKey  = 'UTF-8',
        LanguageLocaleKey = 'en_US',
        ProfileId         = profileId,
        ContactId         = contacts[i].Id
    ));
}
insert users;

System.debug('Created ' + users.size() + ' instructor users');
