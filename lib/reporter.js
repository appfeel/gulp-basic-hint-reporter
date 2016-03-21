
"use strict";

var opts,
    through = require('through2'),
    sprintf = require('sprintf-js').sprintf,
    gutil = require('gulp-util'),
    hinters = ["htmlhint", "jshint", "csslint"],
    getRenderedHTML = require('./html-renderer'),
    writeToFile = require('./file-writter'),
    Promise = require('promise'),
    PluginError = gutil.PluginError,
    colors = gutil.colors,
    errPad = Array("123456 Error(s)  ".length).join(" "),
    warPad = Array("123456 Warning(s)".length).join(" "),
    totaleCount = {},
    totalwCount = {};

function hintReporter(file, enc, cb) {
    var i, hinter, results, errMsg, eCount, wCount, filename, renderedHtml,
        promises = [];

    for (i in hinters) {
        hinter = hinters[i];
        errMsg = "";
        eCount = 0;
        wCount = 0;

        if (opts.showFileSummary && file[hinter] && !file[hinter].success) {
            // Some hinters write results to messages
            results = (file[hinter].results || file[hinter].messages);

            // Show summary on console
            results.forEach(function(err) {
                if ((err.error.code || err.error.type).toUpperCase().charAt(0) === 'E') {
                    eCount += 1;
                } else {
                    wCount += 1;
                }
            });

            if (eCount || wCount) {
                errMsg = hinter.toUpperCase() + ": ";
                errMsg += eCount ? sprintf(colors.red.bold("%6d Error(s)"), eCount) : errPad;
                errMsg += eCount && wCount ? " " : "";
                errMsg += wCount ? sprintf(colors.yellow.bold("%6d Warning(s)"), wCount) : warPad;
                errMsg += " at " + colors.magenta(file.path);
                console.log(errMsg);
            }

            // Write detailed report to file
            renderedHtml = getRenderedHTML(results);
            filename = opts.filenames[hinter];
            promises.push(new Promise(function(resolve, reject) {
                writeToFile(renderedHtml, filename, opts.createMissingFolders, resolve);
            }))
        } else {
            promises.push(new Promise(function(resolve, reject) {
                resolve();
            }))
        }

        totaleCount[hinter] += eCount;
        totalwCount[hinter] += wCount;
    }

    Promise.all(promises)
        .then(function() {
            cb(null, file);
        });
}

function hintSummary(done) {
    var i, hinter, renderedHtml,
        errMsg = "\n" + colors.red.bold("Total summary"),
        isShowMessage = false;

    for (i in hinters) {
        hinter = hinters[i];
        if (totaleCount[hinter] || totalwCount[hinter]) {
            isShowMessage = true;
            errMsg = hinter.toUpperCase() + ": ";
            errMsg += totaleCount[hinter] ? sprintf(colors.red.bold("%6d Error(s)"), totaleCount[hinter]) : errPad;
            errMsg += totaleCount[hinter] && totalwCount[hinter] ? " " : "";
            errMsg += totalwCount[hinter] ? sprintf(colors.yellow.bold("%6d Warning(s)"), totalwCount[hinter]) : warPad;
            errMsg += "\n";
            errMsg += "See extended report at " + colors.magenta(opts.filenames[hinter]);
        }

    }
    isShowMessage && console.log(errMsg);
    opts.fail && process.exit(-1);
    done();
}

module.exports = function reporter(options) {
    var i, hinter, logsPath;

    opts = options || {};
    logsPath = opts.logsPath || "./logs";
    opts.hinters && (hinters = hinters.concat(opts.hinters));
    opts.createMissingFolders = (opts.createMissingFolders === undefined) ? true : opts.createMissingFolders;
    opts.showFileSummary = (opts.showFileSummary === undefined) ? true : opts.showFileSummary;
    opts.fail = (opts.fail === undefined) ? false : opts.fail;
    opts.filenames = opts.filenames || {};

    for (i in hinters) {
        hinter = hinters[i];
        totaleCount[hinter] = 0;
        totalwCount[hinter] = 0;
        opts.filenames[hinter] = logsPath + "/" + (opts.filenames[hinter] || hinter + "-" + (new Date().toISOString()) + ".log.html");
    }

    return through.obj(hintReporter, hintSummary);
};
