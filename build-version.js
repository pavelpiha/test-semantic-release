require('events').EventEmitter.defaultMaxListeners = 130;
const runAll = require('npm-run-all');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const argv = yargs(hideBin(process.argv))
  .help('help')
  .version('version', '1.0.0')
  .command('$0 <ver>', 'build app version <ver>')
  .option('skip-publish', {
    alias: 's',
    type: 'boolean',
    description: 'Skip libraries publish',
  }).argv;

console.log('Build version: ', argv.ver);

const libs = ['model', 'data', 'shared', ['widgets', 'security']];

console.log(libs);

console.log(libs.flat(2).map((item) => `version:${item}-lib {1} {2}`));

// parallel version for all libs
console.log('Update libs version.....');
runAll(
  libs.flat().map((item) => `version:${item}-lib {1} {2}`),
  {
    parallel: true,
    printName: true,
    stdout: process.stdout,
    arguments: [argv.ver, '--allow-same-version'],
  }
)
  .then((res) => {
    console.log('Update version res: ', res);
    console.log('Build and link libs.....');
    return libs.reduce((prevPromise, nextLib) => {
      return prevPromise.then(() => {
        if (!Array.isArray(nextLib)) {
          buildLibs = [nextLib];
        } else {
          buildLibs = nextLib;
        }
        return Promise.all(
          buildLibs.map((buildLib) => {
            console.log('Build and link: ', buildLib);
            return runAll(`build:${buildLib}-lib`, {
              parallel: true,
              printLabel: true,
              silent: false,
              stderr: process.stderr,
              stdout: process.stdout,
            }).then(
              () => {
                return runAll(`link:${buildLib}-lib`, {
                  parallel: true,
                  printLabel: true,
                  silent: false,
                  stderr: process.stderr,
                  stdout: process.stdout,
                });
              },
              () => {
                process.exit(1);
              }
            );
          })
        );
      });
    }, Promise.resolve());
  })
  .then((res) => {
    console.log('argv: ', argv);
    console.log('Build/link libs result: ', res);
    console.log('Publish/install libs......');
    if (argv.skipPublish) {
      console.log('Skip publishing.....');
    } else {
      runAll(
        libs.flat(2).map((item) => `publish:${item}-lib`),
        {
          parallel: true,
          printLabel: true,
          silent: false,
          stderr: process.stderr,
          stdout: process.stdout,
        }
      ).then(
        () => {
          console.log(libs.flat(2).map((item, idx) => `install:exact {${idx + 1}}`));
          console.log(libs.flat(2).map((lib) => `@pavelpiha/test-semantic-release-${lib}@${argv.ver}`));
          console.log('Install libraries');
          return runAll(
            libs.flat(2).map((item, idx) => `install:exact {${idx + 1}}`),
            {
              parallel: false,
              printLabel: true,
              silent: false,
              stderr: process.stderr,
              stdout: process.stdout,
              arguments: libs.flat(2).map((lib) => `@pavelpiha/test-semantic-release-${lib}@${argv.ver}`),
            }
          ).then(
            () => {
              console.log('Done!!!');
            },
            (err) => {
              console.error('Failed: ', err);
              process.exit(1);
            }
          );
        },
        (err) => {
          console.error('Failed: ', err);
          process.exit(1);
        }
      );
    }
  });
