"use strict";

/**
 * Holds information about a remote file.
 */

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
    (0, _createClass3.default)(FileInfo, null, [{
        key: "Type",
        get: function get() {
            return {
                File: 0,
                Directory: 1,
                SymbolicLink: 2,
                Unknown: 3
            };
        }
    }, {
        key: "Permission",
        get: function get() {
            return {
                Read: 1,
                Write: 2,
                Execute: 4
            };
        }

        /**
         * @param {string} name 
         */

    }]);

    function FileInfo(name) {
        (0, _classCallCheck3.default)(this, FileInfo);

        this.name = name;
        this.type = FileInfo.Type.Unknown;
        this.size = -1;
        this.hardLinkCount = 0;
        this.permissions = {
            user: 0,
            group: 0,
            world: 0
        };
        this.link = "";
        this.group = "";
        this.user = "";
        this.date = "";
    }

    (0, _createClass3.default)(FileInfo, [{
        key: "isFile",
        get: function get() {
            return this.type === FileInfo.Type.File;
        }
    }, {
        key: "isDirectory",
        get: function get() {
            return this.type === FileInfo.Type.Directory;
        }
    }, {
        key: "isSymbolicLink",
        get: function get() {
            return this.type === FileInfo.Type.SymbolicLink;
        }
    }]);
    return FileInfo;
}();