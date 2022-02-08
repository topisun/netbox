module.exports = async () => {
  /** @type {import('@jest/types').Config.InitialOptions} */
  const config = {
    transform: {
      '^.+\\.tsx?$': [
        'esbuild-jest',
        {
          target: 'es2016',
          sourcemap: true,
        },
      ],
    },
    setupFilesAfterEnv: ['./jest.setup.ts'],
    testEnvironment: 'jsdom',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{ts,js}', '!src/**/*.d.ts'],
  };
  return config;
};
