const { jestConfig } = require('@salesforce/sfdx-lwc-jest/config');

module.exports = {
    ...jestConfig,
    modulePathIgnorePatterns: ['<rootDir>/.localdevserver'],
    testPathIgnorePatterns: [
        ...jestConfig.testPathIgnorePatterns,
        '<rootDir>/tests/',
    ],
    moduleNameMapper: {
        '^@salesforce/apex/(.*)': '<rootDir>/force-app/test/jest-mocks/apex.js',
    },
};
