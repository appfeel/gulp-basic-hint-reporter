
"use strict";

var templates,
    fs = require('fs'),
    path = require('path');

module.exports = function templatesLoader() {
    if (!templates) {
        var template,
            templatePath = path.join(__dirname, '/templates/');

        templates = {
            body: '',
            content: '',
            item: '',
            noItems: '',
            pageFooter: '',
            pageHeader: '',
            summary: ''
        };

        for (template in templates) {
            templates[template] = fs.readFileSync(templatePath + template + '.html').toString();
        }
    }

    return templates;
};
