module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/server/src"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/server/src/**/*.{ts,tsx}"],
  coverageDirectory: "<rootDir>/server/coverage",
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 50,
      functions: 70,
      lines: 70,
    },
  },
  globals: {
    "ts-jest": {
      tsconfig: "<rootDir>/server/tsconfig.json", // 👈 IMPORTANT
    },
  },
};
