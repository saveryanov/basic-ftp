"use strict";

/**
 * @typedef {Object} ProgressInfo
 * @property {string} name  A name describing this info, e.g. the filename of the transfer.
 * @property {string} type  The type of transfer, typically "upload" or "download".
 * @property {number} bytes  Transferred bytes in current transfer.
 * @property {number} bytesOverall  Transferred bytes since last counter reset. Useful for tracking multiple transfers.
 */

/**
 * Tracks and reports progress of one socket data transfer at a time.
 */

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function () {
    function ProgressTracker() {
        (0, _classCallCheck3.default)(this, ProgressTracker);

        this.bytesOverall = 0;
        this.intervalMillis = 500;
        /** @type {((stopWithUpdate: boolean) => void)} */
        this._stop = noop;
        /** @type {((info: ProgressInfo) => void)} */
        this._handler = noop;
    }

    /**
     * Register a new handler for progress info. Use `undefined` to disable reporting.
     * 
     * @param {((info: ProgressInfo) => void)} [handler] 
     */


    (0, _createClass3.default)(ProgressTracker, [{
        key: "reportTo",
        value: function reportTo() {
            var handler = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};

            this._handler = handler;
        }

        /**
         * Start tracking transfer progress of a socket.
         * 
         * @param {import("net").Socket} socket  The socket to observe.
         * @param {string} name  A name associated with this progress tracking, e.g. a filename.
         * @param {string} type  The type of the transfer, typically "upload" or "download".
         */

    }, {
        key: "start",
        value: function start(socket, name, type) {
            var _this = this;

            var lastBytes = 0;
            this._stop = poll(this.intervalMillis, function () {
                var bytes = socket.bytesRead + socket.bytesWritten;
                _this.bytesOverall += bytes - lastBytes;
                lastBytes = bytes;
                _this._handler({
                    name: name,
                    type: type,
                    bytes: bytes,
                    bytesOverall: _this.bytesOverall
                });
            });
        }

        /**
         * Stop tracking transfer progress.
         */

    }, {
        key: "stop",
        value: function stop() {
            this._stop(false);
        }

        /**
         * Call the progress handler one more time, then stop tracking.
         */

    }, {
        key: "updateAndStop",
        value: function updateAndStop() {
            this._stop(true);
        }
    }]);
    return ProgressTracker;
}();

/**
 * Starts calling a callback function at a regular interval. The first call will go out
 * immediately. The function returns a function to stop the polling.
 * 
 * @param {number} intervalMillis 
 * @param {(() => any)} cb
 * @returns {((stopWithUpdate: boolean) => void)}
 */
function poll(intervalMillis, cb) {
    var handler = cb;
    var stop = function stop(stopWithUpdate) {
        clearInterval(id);
        if (stopWithUpdate) {
            handler();
        }
        handler = noop; // Prevent repeated calls to stop calling handler.
    };
    var id = setInterval(handler, intervalMillis);
    handler();
    return stop;
}

function noop() {/*Do nothing*/}