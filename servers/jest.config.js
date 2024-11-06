module.exports = {
    roots: [
        "<rootDir>/test"
    ],
    testRegex: 'test/(.+)\\.test\\.ts$',
    transform: {
        "^.+\\.tsx?$": "ts-jest"
    },
    moduleFileExtensions: ['ts', 'js'],
    maxConcurrency: 99999,
    maxWorkers: 99999,
    testTimeout: 60000,
};