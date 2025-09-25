module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    url: "http://localhost"
  },
  roots: ["<rootDir>/client/src"],
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/client/src/**/*.{ts,tsx}",
    "!<rootDir>/client/src/**/*.d.ts",
    "!<rootDir>/client/src/main.tsx",
    "!<rootDir>/client/src/vite-env.d.ts"
  ],
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
  setupFiles: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/jest.image-mock.js"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        allowImportingTsExtensions: true,
        moduleResolution: "bundler"
      }
    }]
  },
  testMatch: [
    "<rootDir>/client/src/**/__tests__/**/*.(ts|tsx|js)",
    "<rootDir>/client/src/**/?(*.)(test|spec).(ts|tsx|js)"
  ]
};