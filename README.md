# Generate Changelog

[![NPM Version](https://badge.fury.io/js/generate-changelog.svg)](https://www.npmjs.com/package/generate-changelogf)

Generate a changelog from git commits using semver tags. You can generate changelogs without maintaining a package.json.

## Installation

You can either install it as a dev dependency to be referenced in your npm scripts, or you can install this module globally to be used for all of your repos on your local machine.

```bash
$ npm i generate-changelog-f -D # install it as a dev dependency
# OR
$ npm i generate-changelog-f -g # install it globally
```

## Usage

To use this module, your commit messages have to be in this format:

```
type(category): description [flags]
```

Where `type` is one of the following:

* `breaking`
* `build`
* `ci`
* `chore`
* `docs`
* `feat`
* `fix`
* `other`
* `perf`
* `refactor`
* `revert`
* `style`
* `test`

Where `flags` is an optional comma-separated list of one or more of the following (must be surrounded in square brackets):

* `breaking`: alters `type` to be a breaking change

And `category` can be anything of your choice. If you use a type not found in the list (but it still follows the same format of the message), it'll be grouped under `other`.

### CLI

You can run this module as a CLI app that prepends the new logs to a file (recommended):

```bash
$ changelogf -h

  Usage: generate [options]

  Generate a changelog from git commits.

  Options:

    -h, --help             output usage information
    -V, --version          output the version number
    -t, --tag <range>      generate from specific tag, must be a valid semver version (e.g. v1.2.3 or 1.2.3)
    -x, --exclude <types>  exclude selected commit types (comma separated)
    -f, --file [file]      file to write to, defaults to ./CHANGELOG.md, use - for stdout
    -e, --footer [footer]  footer
    -u, --repo-url [url]   specify the repo URL for commit links, defaults to checking the package.json
```

To generate changelogs from all the commits:

```bash
changelogf
```

To include the footer in the description, provide the footer prefix:

```bash
changelogf -e footer
```

It's possible to create a `./CHANGELOG.md` file for a specific tag, if you want from to generate changelog from 1.8.0 and the previous versions is 1.7.0:

```bash
changelogf -t 1.8.0
```

will generate changelogs from commits from 1.7.0 to 1.8.0 tags

## Testing

To run the test suite, just clone the repository and run the following:

```bash
$ npm i
$ npm test
```

## Contributing

To contribute, please see the [CONTRIBUTING.md](CONTRIBUTING.md) file.

## License

This project is released under the MIT license, which can be found in [`LICENSE.txt`](LICENSE.txt).
