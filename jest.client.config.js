module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/client/src"],
  collectCoverage: true,
  collectCoverageFrom: ["<rootDir>/client/src/**/*.{ts,tsx}"],
  coverageDirectory: "<rootDir>/client/coverage",
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 50,
      functions: 70,
      lines: 70,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/client/src/setupTests.ts"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
};