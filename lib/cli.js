'use strict';

var CLI = require('commander');

var Package = require('../package');

function list(val) {
  return val.split(',');
}

module.exports = CLI
  .description('Generate a changelog from git commits.')
  .version(Package.version)
  .option('-t, --tag [tag]', 'generate from specific tag, must be a valid semver version (e.g. v1.2.3 or 1.2.3)')
  .option('-x, --exclude <types>', 'exclude selected commit types (comma separated)', list)
  .option('-f, --file [file]', 'file to write to, defaults to ./CHANGELOG.md, use - for stdout', './CHANGELOG.md')
  .option('-u, --repo-url [url]', 'specify the repo URL for commit links, defaults to checking the package.json');
