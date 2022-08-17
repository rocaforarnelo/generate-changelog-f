'use strict';

var Bluebird = require('bluebird');
var semver = require('semver');
var CP = Bluebird.promisifyAll(require('child_process'));

var SEPARATOR = '===END===';
var COMMIT_PATTERN = /^([^)]*)(?:\(([^)]*?)\)|):(.*?(?:\[([^\]]+?)\]|))\s*$/;
var FORMAT = '%H%n%s%n%b%n' + SEPARATOR;

/**
 * Get all commits from the last tag (or the first commit if no tags).
 * @param {Object} options - calculation options
 * @param {String} tag - current tag
 * @returns {Promise<Array<Object>>} array of parsed commit objects
 */
exports.getCommits = function (options, tag) {
  options = options || {};
  return new Bluebird(function (resolve) {
    // if (options.tag) {
    //   return resolve(options.tag);
    // }
    return resolve(tag);
  })
    .catch(function () {
      return '';
    })
    .then(function (tag) {
      tag = tag.toString().trim();

      return CP.execAsync(
        'git log --reverse -E --format=' + FORMAT + ' ' + tag,
        {
          maxBuffer: Number.MAX_SAFE_INTEGER
        }
      );
    })
    .catch(function () {
      throw new Error('no commits found');
    })
    .then(function (commits) {
      return commits.split('\n' + SEPARATOR + '\n');
    })
    .map(function (raw) {
      if (!raw) {
        return null;
      }

      var lines = raw.split('\n');
      var commit = {};

      commit.hash = lines.shift();
      commit.subject = lines.shift();
      commit.body = lines.join('\n');

      var parsed = commit.subject.match(COMMIT_PATTERN);

      if (!parsed || !parsed[1] || !parsed[3]) {
        return null;
      }

      commit.type = parsed[1].toLowerCase();
      commit.category = parsed[2] || '';
      commit.subject = parsed[3];

      if (parsed[4]) {
        parsed[4].toLowerCase().split(',').forEach(function (flag) {
          flag = flag.trim();

          switch (flag) {
            case 'breaking':
              commit.type = flag;
              break;
          }
        });
      }

      return commit;
    })
    .filter(function (commit) {
      if (!commit) {
        return false;
      }
      return options.exclude ? options.exclude.indexOf(commit.type) === -1 : true;
    });
};

/**
 * Get all tags.
 * @returns {Promise<Array<String>>} array of parsed commit objects
 */
exports.getAllTags = function (options) {
  return new Bluebird(function (resolve) {
    return resolve(CP.execAsync('git tag'));
  }).then(function (tags) {
    var rawTags = tags.split('\n').reverse().filter(n => n).filter(n => semver.valid(n));
    tags = rawTags;
    if (options.tag != null) {
      var tagIndex = tags.indexOf(options.tag);
      tags = [options.tag];
      console.log('tag = ' + options.tag + ' tagIndex = ' + tagIndex + ' to tags = ' + rawTags[tagIndex + 1] + ' length = ' + rawTags.length);

      if (tagIndex != rawTags.length) {
        tags.push(rawTags[tagIndex + 1]);
      }

    }
    return tags;
  });
};