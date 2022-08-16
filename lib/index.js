'use strict';

var Bluebird = require('bluebird');

var Git = require('./git');
var Package = require('./package');
var Writer = require('./writer');

/**
 * Generate the changelog.
 * @param {Object} options - generation options
 * @param {String} options.repoUrl - repo URL that will be used when linking commits
 * @param {Array} options.exclude - exclude listed commit types (e.g. ['chore', 'style', 'refactor'])
 * @returns {Promise<String>} the \n separated changelog string
 */
exports.generate = function (options) {
  return new Bluebird(function (resolve) {
    return resolve(Git.getAllTags())
  }).then(function (tags) {
    return Bluebird.map(tags, function (tag, index, length) {
      var currentTag = tag;
      if (index < length - 1) {
        currentTag = tags[index + 1] + '..' + tag;
      }
      console.log(currentTag);
      return Bluebird.all([
        Package.extractRepoUrl(),
        Git.getCommits(options, currentTag)
      ])
        .spread(function (repoUrl, commits) {
          options.tag = tag;
          options.repoUrl = options.repoUrl || repoUrl;
          return Writer.markdown(commits, options);
        });
    });
  });
};
