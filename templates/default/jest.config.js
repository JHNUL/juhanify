/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setupAfterEnv.js"],
  transform: {
    "\\.jsx?$": ["<rootDir>/jest.transformer.js"],
  },
};

module.exports = config;
