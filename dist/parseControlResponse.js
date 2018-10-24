"use strict";

var LF = "\n";

/**
 * Parse an FTP control response as a collection of messages. A message is a complete 
 * single- or multiline response. A response can also contain multiple multiline responses 
 * that will each be represented by a message. A response can also be incomplete 
 * and be completed on the next incoming data chunk for which case this function also 
 * describes a `rest`. This function converts all CRLF to LF.
 * 
 * @param {string} text 
 * @returns {{messages: string[], rest: string}} 
 */
module.exports = function parseControlResponse(text) {
    var lines = text.split(/\r?\n/);
    var messages = [];
    var startAt = 0;
    var token = "";
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        // No group has been opened.
        if (token === "") {
            if (isMultiline(line)) {
                // Open a group by setting an expected token.
                token = line.substr(0, 3) + " ";
                startAt = i;
            } else if (isSingle(line)) {
                // Single lines can be grouped immediately.
                messages.push(line);
            }
        }
        // Group has been opened, expect closing token.
        else if (line.startsWith(token)) {
                token = "";
                messages.push(lines.slice(startAt, i + 1).join(LF));
            }
    }
    // The last group might not have been closed, report it as a rest.
    var rest = token !== "" ? lines.slice(startAt).join(LF) + LF : "";
    return { messages: messages, rest: rest };
};

function isSingle(line) {
    return (/^\d\d\d /.test(line)
    );
}

function isMultiline(line) {
    return (/^\d\d\d-/.test(line)
    );
}