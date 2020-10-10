'use strict'

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/gen/*.ts'],
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  testEnvironment: 'node',
  preset: 'ts-jest',
}
