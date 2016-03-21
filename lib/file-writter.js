
"use strict";

var wrStream, lastFilename,
    fs = require('fs'),
    path = require('path'),
    loadTemplates = require('./templates-loader');

fs.mkdirTree = function(dir) {
    var parent = path.dirname(dir);
    if (!fs.existsSync(parent)) {
        fs.mkdirTree(parent);
    }
    if (!fs.existsSync(dir)) {
        fs.mkdir(dir);
    }
};

module.exports = function writeToFile(content, filename, createMissingFolders, cb) {
    var templates = loadTemplates();

    if (wrStream && lastFilename !== filename) {
        wrStream.end();
        wrStream = null;
    }

    if (!wrStream) {
        var stats,
            size = 0,
            dir = path.dirname(filename);

        if (createMissingFolders && !fs.existsSync(dir)) {
            fs.mkdirTree(dir);
        }

        wrStream = fs.createWriteStream(filename);
        wrStream.write(templates.pageHeader);
        // TODO: not working
        // wrStream.on('end', function() {
        //     var wrStream1 = fs.createWriteStream(filename);
        //     wrStream1.write(templates.pageFooter);
        // });
        filename = filename;
    }

    wrStream.write(content, (typeof cb === 'function') ? cb : function() { });
}
