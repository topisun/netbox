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
  };
  return config;
};
