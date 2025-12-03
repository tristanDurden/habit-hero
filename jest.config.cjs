/** @type {import('jest').Config} */
const config = {
  rootDir: ".",
  testEnvironment: "jsdom",
  roots: ["<rootDir>/tests"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s?(x)"],
  collectCoverageFrom: [
    "lib/**/*.{ts,tsx}",
    "hooks/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/index.{ts,tsx}",
  ],
};

module.exports = config;


