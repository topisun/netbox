module.exports = async () => {
  /** @type {import('@jest/types').Config.InitialOptions} */
  const config = {
    transform: {
      '^.+\\.tsx?$': [
        'esbuild-jest',
        {
          target: 'es2016',
        },
      ],
    },
    setupFilesAfterEnv: ['./jest.setup.ts'],
    testEnvironment: 'jsdom',
  };
  return config;
};
