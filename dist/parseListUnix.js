"use strict";

var FileInfo = require("./FileInfo");

/**
 * This parser is based on the FTP client library source code in Apache Commons Net provided
 * under the Apache 2.0 license. It has been simplified and rewritten to better fit the Javascript language.
 * 
 * http://svn.apache.org/viewvc/commons/proper/net/tags/NET_3_6/src/main/java/org/apache/commons/net/ftp/parser/
 *
 * Below is the regular expression used by this parser.
 *
 * Permissions:
 *    r   the file is readable
 *    w   the file is writable
 *    x   the file is executable
 *    -   the indicated permission is not granted
 *    L   mandatory locking occurs during access (the set-group-ID bit is
 *        on and the group execution bit is off)
 *    s   the set-user-ID or set-group-ID bit is on, and the corresponding
 *        user or group execution bit is also on
 *    S   undefined bit-state (the set-user-ID bit is on and the user
 *        execution bit is off)
 *    t   the 1000 (octal) bit, or sticky bit, is on [see chmod(1)], and
 *        execution is on
 *    T   the 1000 bit is turned on, and execution is off (undefined bit-
 *        state)
 *    e   z/OS external link bit
 *    Final letter may be appended:
 *    +   file has extended security attributes (e.g. ACL)
 *    Note: local listings on MacOSX also use '@';
 *    this is not allowed for here as does not appear to be shown by FTP servers
 *    {@code @}   file has extended attributes
 */
var RE_LINE = new RegExp("([bcdelfmpSs-])" // file type
+ "(((r|-)(w|-)([xsStTL-]))((r|-)(w|-)([xsStTL-]))((r|-)(w|-)([xsStTL-])))\\+?" // permissions

+ "\\s*" // separator TODO why allow it to be omitted??

+ "(\\d+)" // link count

+ "\\s+" // separator

+ "(?:(\\S+(?:\\s\\S+)*?)\\s+)?" // owner name (optional spaces)
+ "(?:(\\S+(?:\\s\\S+)*)\\s+)?" // group name (optional spaces)
+ "(\\d+(?:,\\s*\\d+)?)" // size or n,m

+ "\\s+" // separator

/*
    * numeric or standard format date:
    *   yyyy-mm-dd (expecting hh:mm to follow)
    *   MMM [d]d
    *   [d]d MMM
    *   N.B. use non-space for MMM to allow for languages such as German which use
    *   diacritics (e.g. umlaut) in some abbreviations.
*/
+ "(" + "(?:\\d+[-/]\\d+[-/]\\d+)" + // yyyy-mm-dd
"|(?:\\S{3}\\s+\\d{1,2})" + // MMM [d]d
"|(?:\\d{1,2}\\s+\\S{3})" + // [d]d MMM
")" + "\\s+" // separator

/*
    year (for non-recent standard format) - yyyy
    or time (for numeric or recent standard format) [h]h:mm
*/
+ "((?:\\d+(?::\\d+)?))" // (20)

+ "\\s" // separator

+ "(.*)"); // the rest (21)

var accessGroups = ["user", "group", "world"];

exports.testLine = function (line) {
    // Example: "-rw-r--r--+   1 patrick  staff   1057 Dec 11 14:35 test.txt"
    return line !== undefined && line.match(RE_LINE) !== null;
};

exports.parseLine = function (line) {
    var groups = line.match(RE_LINE);
    if (groups) {
        // Ignore parent directory links
        var name = groups[21].trim();
        if (name === "." || name === "..") {
            return undefined;
        }

        // Map list entry to FileInfo instance        
        var file = new FileInfo(name);
        file.size = parseInt(groups[18], 10);
        file.user = groups[16];
        file.group = groups[17];
        file.hardLinkCount = parseInt(groups[15], 10);
        file.date = groups[19] + " " + groups[20];

        // Set file type
        switch (groups[1].charAt(0)) {
            case "d":
                file.type = FileInfo.Type.Directory;
                break;
            case "e":
                // NET-39 => z/OS external link
                file.type = FileInfo.Type.SymbolicLink;
                break;
            case "l":
                file.type = FileInfo.Type.SymbolicLink;
                break;
            case "b":
            case "c":
                file.type = FileInfo.Type.File; // TODO change this if DEVICE_TYPE implemented
                break;
            case "f":
            case "-":
                file.type = FileInfo.Type.File;
                break;
            default:
                // A 'whiteout' file is an ARTIFICIAL entry in any of several types of
                // 'translucent' filesystems, of which a 'union' filesystem is one.
                file.type = FileInfo.Type.Unknown;
        }

        // Set permissions
        accessGroups.forEach(function (access, i) {
            var g = (i + 1) * 4;
            var value = 0;
            if (groups[g] !== "-") {
                value += FileInfo.Permission.Read;
            }
            if (groups[g + 1] !== "-") {
                value += FileInfo.Permission.Write;
            }
            var execToken = groups[g + 2].charAt(0);
            if (execToken !== "-" && execToken.toUpperCase() !== execToken) {
                value += FileInfo.Permission.Execute;
            }
            file.permissions[access] = value;
        });

        // Separate out the link name for symbolic links
        if (file.isSymbolicLink) {
            var end = name.indexOf(" -> ");
            if (end > -1) {
                file.name = name.substring(0, end);
                file.link = name.substring(end + 4);
            }
        }
        return file;
    }
    return undefined;
};