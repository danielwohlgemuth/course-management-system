// Creates Customer Community Users for all 5 course students.
// Run via: sf apex run --file scripts/apex/create_students.apex
//
// Next step: assign the CourseStudent permission set by running:
//   sf apex run --file scripts/apex/assign_student_permission_set.apex

List<Account> accts = [SELECT Id FROM Account WHERE Name = 'Course Management' LIMIT 1];
Account acct;
if (accts.isEmpty()) {
    acct = new Account(Name = 'Course Management');
    insert acct;
} else {
    acct = accts[0];
}

List<String> firstNames = new List<String>{'Alice',     'Ben',        'Chloe',   'David',      'Emma'};
List<String> lastNames  = new List<String>{'Chen',      'Torres',     'Kim',     'Patel',      'Fischer'};
List<String> aliases    = new List<String>{'achen',     'btorres',    'ckim',    'dpatel',     'efischer'};
List<String> nicknames  = new List<String>{'AliceChen', 'BenTorres',  'ChloeKim','DavidPatel', 'EmmaFischer'};

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

Id profileId = [SELECT Id FROM Profile WHERE Name = 'Customer Community User' LIMIT 1].Id;

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

System.debug('Created ' + users.size() + ' student users');
