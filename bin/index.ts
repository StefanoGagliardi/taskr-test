import chalk from 'chalk';

['react', 'react-dom'].forEach((dependency) => {
  try {
    // When 'npm link' is used it checks the clone location. Not the project.
    require.resolve(dependency);
  } catch (err) {
    console.warn(
      `The module '${dependency}' was not found. Next.js requires that you include it in 'dependencies' of your 'package.json'. To add it, run 'npm install ${dependency}'`,
    );
  }
});

console.log(chalk.yellow('Init bin/vitals.ts'));