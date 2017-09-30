// Copyright (c) 2017 PlanGrid, Inc.

const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

const inquirer = require('inquirer');
const chalk = require('chalk');

const runColor = chalk.bold.blue;
const errColor = chalk.bold.red;
const goodColor = chalk.bold.green;

const appDir = fs.realpathSync(process.cwd());

const buildCommand = 'npm run build';
const branchCommand = 'git rev-parse --abbrev-ref HEAD';
const jestCommand = `${path.join(appDir, 'node_modules/.bin/jest')} --env=jsdom --silent`;

inquirer.prompt([
  {
    type: 'list',
    name: 'publish',
    message: 'Select a version to publish. This will run all tests and build first.',
    default: 0,
    choices: ['Abort', 'patch', 'minor', 'major']
  }
]).then(function(answers) {
  const answer = answers.publish;

  if (answer === 'Abort') {
    console.log(errColor('aborting publish'));
    return;
  }

  const execOpts = {
    stdio: [0, 1, 2]
  };

  //run tests
  try {
    console.log(runColor('running tests'));
    execSync(jestCommand);
  } catch (e) {
    console.log(errColor('Tests failed. Aborting publish.'));
    return;
  }

  // make sure we're on the master branch
  const branch = execSync(branchCommand);
  const branchString = branch.toString().trim();
  if (branchString !== 'master') {
    console.log(errColor(`must be on master branch to publish. Currently on '${branchString}'`));
    console.log(errColor('Aborting publish'));
    return;
  }

  // run build
  try {
    console.log(runColor('running build'));
    execSync(buildCommand, execOpts);
  } catch (e) {
    console.log(errColor('\nBuild failed. Aborting publish.\n'));
    return;
  }

  // bump version
  try {
    console.log(runColor('bumping version, creating tag commit'));
    execSync(`npm version ${answer}`, execOpts);
  } catch (e) {
    console.log(errColor('Version bump failed. Aborting.'));
    return;
  }

  // publish
  try {
    console.log(runColor('publishing to npm'));
    execSync('npm publish', execOpts);
  } catch (e) {
    console.log(errColor('Publishing failed'));
    return;
  }

  try {
    console.log(runColor('running git push origin master'));
    execSync('git push origin master', execOpts);
  } catch (e) {
    console.log(errColor('git push origin master failed'));
    return;
  }

  try {
    console.log(runColor('running git push origin --tags'));
    execSync('git push origin --tags', execOpts);
  } catch (e) {
    console.log(errColor('git push origin --tags failed'));
    return;
  }

  console.log(goodColor('new version successfully published to npm'));
});
