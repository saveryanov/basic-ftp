"use strict";

var availableParsers = [require("./parseListUnix"), require("./parseListDOS")];

/**
 * Parse raw list data.
 * 
 * @param {string} rawList
 * @returns {import("./FileInfo")[]} 
 */
module.exports = function parseList(rawList) {
    var lines = rawList.split(/\r?\n/)
    // Strip possible multiline prefix
    .map(function (line) {
        return (/^(\d\d\d)-/.test(line) ? line.substr(3) : line
        );
    }).filter(function (line) {
        return line.trim() !== "";
    });
    if (lines.length === 0) {
        return [];
    }
    // Pick a line in the middle of the list as a test candidate to find a compatible parser.
    var test = lines[Math.ceil((lines.length - 1) / 2)];
    var parser = firstCompatibleParser(test, availableParsers);
    if (!parser) {
        throw new Error("This library only supports Unix- or DOS-style directory listing. Your FTP server seems to be using another format. You can see the transmitted listing when setting `client.ftp.verbose = true`. You can then provide a custom parser to `client.parseList`, see the documentation for details.");
    }
    return lines.map(parser.parseLine).filter(function (info) {
        return info !== undefined;
    });
};

/**
 * Returns the first parser that doesn't return undefined for the given line.
 */
function firstCompatibleParser(line, parsers) {
    return parsers.find(function (parser) {
        return parser.testLine(line) === true;
    });
}