"use strict";

var _getPrototypeOf = require("babel-runtime/core-js/object/get-prototype-of");

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require("babel-runtime/helpers/possibleConstructorReturn");

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require("babel-runtime/helpers/inherits");

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var EventEmitter = require("events");

/**
 * Collect binary data chunks as a string.
 */
module.exports = function (_EventEmitter) {
    (0, _inherits3.default)(StringWriter, _EventEmitter);

    function StringWriter(encoding) {
        (0, _classCallCheck3.default)(this, StringWriter);

        var _this = (0, _possibleConstructorReturn3.default)(this, (StringWriter.__proto__ || (0, _getPrototypeOf2.default)(StringWriter)).call(this));

        _this.encoding = encoding;
        _this.text = "";
        _this.write = _this.end = _this.append;
        return _this;
    }

    (0, _createClass3.default)(StringWriter, [{
        key: "append",
        value: function append(chunk) {
            if (chunk) {
                this.text += chunk.toString(this.encoding);
            }
        }
    }]);
    return StringWriter;
}(EventEmitter);