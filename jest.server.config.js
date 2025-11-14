module.exports = {
    preset: "ts-jest/presets/default",
    testEnvironment: "node",
    roots: ["<rootDir>/server/src"],
    collectCoverage: true,
    collectCoverageFrom: [
        "<rootDir>/server/src/**/*.{ts,tsx}",
        "!<rootDir>/server/src/index.ts"
    ],
    coverageDirectory: "<rootDir>/server/coverage",
    coverageThreshold: {
        global: {
            statements: 70,
            branches: 50,
            functions: 70,
            lines: 70,
        },
    },
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },
    transform: {
        "^.+\\.tsx?$": ["ts-jest", {tsconfig: "<rootDir>/server/tsconfig.json"}], // ✅ nouvelle syntaxe
    },
};
