'use strict';

var Bluebird = require('bluebird');

var PR_REGEX = new RegExp(/#[1-9][\d]*/g);
var TYPES = {
  breaking: 'Breaking Changes',
  build: 'Build System / Dependencies',
  ci: 'Continuous Integration',
  chore: 'Chores',
  docs: 'Documentation Changes',
  feat: 'New Features',
  fix: 'Bug Fixes',
  other: 'Other Changes',
  perf: 'Performance Improvements',
  refactor: 'Refactors',
  revert: 'Reverts',
  style: 'Code Style Changes',
  test: 'Tests'
};

/**
 * Generate the commit URL for the repository provider.
 * @param {String} baseUrl - The base URL for the project
 * @param {String} commitHash - The commit hash being linked
 * @return {String} The URL pointing to the commit
 */
exports.getCommitUrl = function (baseUrl, commitHash) {
  var urlCommitName = 'commit';

  if (baseUrl.indexOf('bitbucket') !== -1) {
    urlCommitName = 'commits';
  }

  if (baseUrl.indexOf('gitlab') !== -1 && baseUrl.slice(-4) === '.git') {
    baseUrl = baseUrl.slice(0, -4);
  }

  return baseUrl + '/' + urlCommitName + '/' + commitHash;
};

/**
 * Generate the markdown for the changelog.
 * @param {String} version - the new version affiliated to this changelog
 * @param {Array<Object>} commits - array of parsed commit objects
 * @param {Object} options - generation options
 * @param {String} options.repoUrl - repo URL that will be used when linking commits
 * @returns {Promise<String>} the \n separated changelog string
 */
exports.markdown = function (commits, options) {
  var content = [];
  // var date = new Date().toJSON().slice(0, 10);
  var heading;

  heading = '#### ' + options.tag
  // + ' (' + date + ')'

  content.push(heading);
  content.push('');

  return Bluebird.resolve(commits)
    .bind({ types: {} })
    .each(function (commit) {
      var type = TYPES[commit.type] || commit.type;
      var category = commit.category;

      this.types[type] = this.types[type] || {};
      this.types[type][category] = this.types[type][category] || [];

      this.types[type][category].push(commit);
    })
    .then(function () {
      return Object.keys(this.types).sort();
    })
    .each(function (type) {
      var types = this.types;

      var typeDescription = type[0] == type[0].toUpperCase() ? type : ('OTHER CHANGES (' + type + ')');

      content.push('##### ' + typeDescription);
      content.push('');

      Object.keys(this.types[type]).forEach(function (category) {
        var prefix = '*';
        var nested = types[type][category].length > 1;
        var categoryHeading = prefix + (category ? ' **' + category + ':**' : '');

        if (nested && category) {
          content.push(categoryHeading);
          prefix = '  *';
        } else {
          prefix = categoryHeading;
        }
        types[type][category].forEach(function (commit) {
          var shorthash = commit.hash.substring(0, 8);
          var subject = commit.subject;

          if (options.repoUrl) {
            shorthash = '[' + shorthash + '](' + exports.getCommitUrl(options.repoUrl, commit.hash) + ')';

            subject = subject.replace(PR_REGEX, function (pr) {
              return '[' + pr + '](' + options.repoUrl + '/pull/' + pr.slice(1) + ')';
            });
          }

          content.push(prefix + ' ' + subject + ' (' + shorthash + ')' + (commit.footer == '' || commit.footer == null ? '' : ' (' + commit.footer + ')'));
        });
      });

      content.push('');
    })
    .then(function () {
      content.push('');
      return content.join('\n');
    });
};
