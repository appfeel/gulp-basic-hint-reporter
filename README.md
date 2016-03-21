gulp-hint-web-reporter
====================

[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://npmjs.org/package/gulp-hint-web-reporter)
[![NPM version](http://img.shields.io/npm/v/gulp-hint-web-reporter.svg?style=flat)](https://npmjs.org/package/gulp-hint-web-reporter)
[![NPM version](http://img.shields.io/npm/dm/gulp-hint-web-reporter.svg?style=flat)](https://npmjs.org/package/gulp-hint-web-reporter)
[![Build Status](http://img.shields.io/travis/appfeel/gulp-hint-web-reporter.svg?style=flat)](https://travis-ci.org/appfeel/gulp-hint-web-reporter)
[![Dependency Status](http://img.shields.io/gemnasium/appfeel/gulp-hint-web-reporter.svg?style=flat)](https://gemnasium.com/appfeel/gulp-hint-web-reporter)

A simple reporter for [gulp-htmlhint](https://www.npmjs.com/package/gulp-htmlhint), [gulp-jshint](https://www.npmjs.com/package/gulp-jshint) and [gulp-csslint](https://www.npmjs.com/package/gulp-csslint) that writes it's output as a nice console summary and extended web report.

## Installation

```bash
npm install gulp-hint-web-reporter --save-dev
```

## Usage

```javascript
var gulp = require('gulp');
var webReporter = require('gulp-hint-web-reporter');

gulp.task('lint', function() {
  return gulp.src('./**/*.js')
    .pipe(htmlhint())
    .pipe(webReporter(options));
});
```

## Options

```javascript
var options = {
    logsPath: "./logs",
    hinters: ["htmlhint"],
    filenames: {
        htmlhint: "mylog.html"
    },
    createMissingFolders: true
};
```

### `logsPath`
Default: `"./logs"`

The folder to write output files for hint results.

### `hinters`
Default: `["htmlhint", "jshint", "csslint"]`

Additional hinters (looks in `file[hinter]` for hint results/messages).

### `filenames`
Default: 
```json
{
    "htmlhint": "htmlhint-{datetime}.log.html",
    "jshint":   "jshint-{datetime}.log.html",
    "csslint":  "csslint-{datetime}.log.html"
}
```

Where `{datetime}` is replaced by `new Date().toISOString()`

For each hinter defines the log name. In example, by default for `jshint` it looks like: `./logs/jshint-2016-03-15T10:04:44.883Z.log.html`

### `createMissingFolders`
Default: `true`

Enables or disables creation of any folders given in the filename that do not exist. 
If disabled and the given path contains folders which do not exist, an ENOENT error is thrown. 

### `showFileSummary`
Default: `true`

Enables or disables file summary on console (just a global summary will be shown when disabled).

### `fail`
Default: `false`

Forces reporter to fail if errors are found.

## License

[MIT](http://opensource.org/licenses/MIT) © [AppFeel](https://appfeel.com)

## Release History

* 1.1.5 Improve html reports
* 1.1.2 Add travis.yml and readme badges
* 1.1.0 Add fail option
* 1.0.0 Initial release
