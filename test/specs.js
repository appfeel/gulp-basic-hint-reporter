
"use strict";

var readFilecontents, getExpected, getExpectedStdout, getOutput, hookStream, initCase, finishCase,
    isWrittingTest = false,
    del = require("del"),
    assert = require("assert"),
    gulp = require('gulp'),
    fs = require('fs'),
    htmlhint = require('gulp-htmlhint'),
    jshint = require('gulp-jshint'),
    csslint = require('gulp-csslint'),
    plumber = require('gulp-plumber'),
    reporter = require('../'),
    fileWritter = require('../lib/file-writter'),
    casesStdout = {};

readFilecontents = function(filename) {
    var fcontents;
    try {
        fcontents = fs.readFileSync(filename).toString('utf8');
    } catch (e) { }
    return fcontents;
};
getExpected = function(caseName) {
    return readFilecontents('./test/cases/' + caseName + '/expected.log');
};
getExpectedStdout = function(caseName) {
    return readFilecontents('./test/cases/' + caseName + '/expected.stdout.log');
};
getOutput = function(caseName) {
    return readFilecontents('./test/logs/' + caseName + ".html");
};

hookStream = function(hookedStream, fn) {
    var originalWrite = hookedStream.write;
    hookedStream.write = fn;
    return {
        unhook: function() {
            hookedStream.write = originalWrite;
        },
        originalWrite: originalWrite
    };
};
initCase = function(caseNbr) {
    var hookedStream;
    casesStdout[caseNbr] = "";
    hookedStream = hookStream(process.stdout, function() {
        var i;
        for (i in arguments) {
            casesStdout[caseNbr] += arguments[i];
        }
        //hookedStream.originalWrite.apply(this, arguments);
    });

    return hookedStream;
}
finishCase = function(caseNbr, hookedStream, done) {
    var expectedOutput, expectedStdout,
        caseOutput = getOutput(caseNbr).replace(new RegExp(__dirname, "g"), ""),
        caseStdout = casesStdout[caseNbr].replace(new RegExp(__dirname, "g"), "");

    hookedStream.unhook();

    if (isWrittingTest) {
        fs.writeFileSync('./test/cases/' + caseNbr + '/expected.log', caseOutput);
        fs.writeFileSync('./test/cases/' + caseNbr + '/expected.stdout.log', caseStdout);
    }

    expectedOutput = getExpected(caseNbr);
    expectedStdout = getExpectedStdout(caseNbr)

    fs.writeFileSync('./test/logs/' + caseNbr + ".stdout.log", caseStdout);

    setTimeout(function() {
        assert.equal(caseOutput, expectedOutput);
        assert.equal(caseStdout, expectedStdout);
        done && done();
    }, 1);
};

describe('gulp-hint-web-reporter', function() {
    before(function(done) {
        del.sync('./test/logs');
        done();
    });

    it('should fail hint', function(done) {
        var caseNbr = 'case1',
            hookedStream = initCase(caseNbr),
            isErrorHandlerCalled = false;

        gulp.src('./test/cases/' + caseNbr + '/*.html')
            .pipe(plumber(function errorHandler(e) {
                isErrorHandlerCalled = true;
                finishCase(caseNbr, hookedStream, done);
            }))
            .pipe(htmlhint())
            .pipe(reporter({
                logsPath: "./test/logs",
                filenames: {
                    htmlhint: caseNbr + ".html"
                },
                fail: true
            }))
            .on('end', function() {
                hookedStream.unhook();
                assert(isErrorHandlerCalled, "Plugin should have failed");
                !isErrorHandlerCalled && done();
            })
            .pipe(plumber.stop());
    });

    it('should create log report for html file', function(done) {
        var caseNbr = 'case2',
            hookedStream = initCase(caseNbr);

        gulp.src('./test/cases/' + caseNbr + '/*.html')
            .pipe(htmlhint())
            .pipe(reporter({
                logsPath: "./test/logs",
                filenames: {
                    htmlhint: caseNbr + ".html"
                }
            }))
            .on('finish', function() {
                finishCase(caseNbr, hookedStream, done);
            });
    });

    it('should create log report for js file', function(done) {
        var caseNbr = 'case3',
            hookedStream = initCase(caseNbr);

        gulp.src('./test/cases/' + caseNbr + '/*.js')
            .pipe(jshint())
            .pipe(reporter({
                logsPath: "./test/logs",
                filenames: {
                    jshint: caseNbr + ".html"
                }
            }))
            .on('finish', function() {
                finishCase(caseNbr, hookedStream, done);
            });
    });

    it('should create log report for css file', function(done) {
        var caseNbr = 'case4',
            hookedStream = initCase(caseNbr);

        gulp.src('./test/cases/' + caseNbr + '/*.css')
            .pipe(csslint())
            .pipe(reporter({
                logsPath: "./test/logs",
                filenames: {
                    csslint: caseNbr + ".html"
                }
            }))
            .on('finish', function() {
                finishCase(caseNbr, hookedStream, done);
            });
    });
});
