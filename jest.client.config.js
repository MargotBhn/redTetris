module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/client/src"],
  collectCoverage: true,
  collectCoverageFrom: [
      "<rootDir>/client/src/**/*.{ts,tsx}",
      "!<rootDir>/client/src/main.tsx",  // ✅ Exclure main.tsx
      "!<rootDir>/client/src/index.tsx", // ✅ Exclure index.tsx (au cas où)
      "!<rootDir>/client/src/**/*.d.ts", // ✅ Exclure les fichiers de déclaration
      "!<rootDir>/client/src/vite-env.d.ts", // ✅ Exclure vite-env
      "!<rootDir>/client/src/setupTests.ts", // ✅ Exclure setupTests
      "!<rootDir>/client/src/__mocks__/**", // ✅ Exclure les mocks
      "!<rootDir>/client/src/__tests__/**", // ✅ Exclure les fichiers de tests
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
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg)$": "<rootDir>/client/src/__mocks__/fileMock.js"
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        jsx: "react-jsx",
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        allowImportingTsExtensions: true,
        moduleResolution: "bundler",
      }
    }]
  }
};