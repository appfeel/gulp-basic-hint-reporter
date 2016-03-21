
"use strict";

var acid,
    loadTemplates = require('./templates-loader');


function escapeHtml(text) {
    if (typeof text !== 'string') {
        return text;
    }

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function isError(errorCode) {
    return errorCode && errorCode.toUpperCase()[0] === 'E';
}

function calculateNumberOfFailures(results) {
    var numberOfFailures = {
        failures: 0,
        errors: 0,
        warnings: 0
    };

    results.forEach(function(element) {
        numberOfFailures.failures += 1;
        if (isError(element.error.type)) {
            numberOfFailures.errors += 1;
        } else {
            numberOfFailures.warnings += 1;
        }
    });

    return numberOfFailures;
}

function prepareContent(results, templates) {
    var bodyContent = '',
        items = '',
        previousFile = '',
        content = '';

    if (results.length === 0) {
        return templates.noItems;
    }

    results.forEach(function(element) {
        var errType, errLine, errCol, errEvidence, errReason, errRule, errLink,
            file = element.file,
            error = element.error;

        if (previousFile !== file) {
            if (content.length && items.length) {
                bodyContent += content.replace('{items}', items);
            }
            previousFile = file;
            acid += 1;
            content = templates.content
                .replace(/\{acid\}/g, acid)
                .replace('{file}', file);

            items = '';
        }

        errType = error.type || error.code || "error";
        errLine = error.line || 0;
        errCol = error.col || error.character || 0;
        errEvidence = (error.evidence || "").substr(0, 30);
        errReason = error.reason || (error.rule && error.rule.description) || "";
        errRule = (error.rule && error.rule.id) || "";
        errLink = (error.rule && error.rule.link) || "#";

        items += templates.item
            .replace('{class}', isError(errType) ? 'danger' : 'warning')
            .replace('{code}', errType)
            .replace('{line}', escapeHtml(errLine))
            .replace('{col}', escapeHtml(errCol))
            .replace('{evidence}', escapeHtml(errEvidence))
            .replace('{reason}', escapeHtml(errReason))
            .replace('{rule}', escapeHtml(errRule))
            .replace('{link}', errLink);
    });

    bodyContent += content.replace('{items}', items);
    return bodyContent;
}

function prepareSummary(results, templates) {
    var numberOfFailures = calculateNumberOfFailures(results),
        summary = templates.summary
            .replace('{failures}', numberOfFailures.failures)
            .replace('{errors}', numberOfFailures.errors)
            .replace('{warnings}', numberOfFailures.warnings);

    return numberOfFailures.failures ? summary : "";
}

module.exports = function getRenderedHTML(results, templates) {
    var templates = loadTemplates();
    
    acid = 0;
    return templates.body
        .replace('{content}', prepareContent(results, templates))
        .replace('{summary}', prepareSummary(results, templates));
}