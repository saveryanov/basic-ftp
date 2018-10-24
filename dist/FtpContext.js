"use strict";

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Socket = require("net").Socket;
var parseControlResponse = require("./parseControlResponse");

/**
 * @typedef {Object} Task
 * @property {(...args: any[]) => void} resolve - Resolves the task.
 * @property {(...args: any[]) => void} reject - Rejects the task.
 */

/**
 * @typedef {(response: Object, task: Task) => void} ResponseHandler
 */

/**
 * FTPContext holds the control and data sockets of an FTP connection and provides a
 * simplified way to interact with an FTP server, handle responses, errors and timeouts.
 * 
 * It doesn't implement or use any FTP commands. It's only a foundation to make writing an FTP
 * client as easy as possible. You won't usually instantiate this, but use `Client`.
 */
module.exports = function () {

    /**
     * Instantiate an FTP context.
     * 
     * @param {number} [timeout=0] - Timeout in milliseconds to apply to control and data connections. Use 0 for no timeout.
     * @param {string} [encoding="utf8"] - Encoding to use for control connection. UTF-8 by default. Use "latin1" for older servers. 
     */
    function FTPContext() {
        var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var encoding = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "utf8";
        (0, _classCallCheck3.default)(this, FTPContext);

        /**
         * Timeout applied to all connections.
         * @private
         * @type {number}
         */
        this._timeout = timeout;
        /**
         * Current task to be resolved or rejected. 
         * @private
         * @type {(Task | undefined)} 
         */
        this._task = undefined;
        /**
         * Function that handles incoming messages and resolves or rejects a task.
         * @private
         * @type {(ResponseHandler | undefined)}
         */
        this._handler = undefined;
        /**
         * A multiline response might be received as multiple chunks.
         * @private
         * @type {string}
         */
        this._partialResponse = "";
        /**
         * The encoding used when reading from and writing to the control socket.
         * @type {string}
         */
        this.encoding = encoding;
        /**
         * Options for TLS connections.
         * @type {import("tls").ConnectionOptions}
         */
        this.tlsOptions = {};
        /**
         * IP version to prefer (4: IPv4, 6: IPv6).
         * @type {(string | undefined)}
         */
        this.ipFamily = undefined;
        /**
         * Log every communication detail.
         * @type {boolean}
         */
        this.verbose = false;
        /**
         * The control connection to the FTP server.
         * @type {Socket}
         */
        this.socket = new Socket();
        /**
         * The current data connection to the FTP server.
         * @type {(Socket | undefined)}
         */
        this.dataSocket = undefined;
    }

    /**
     * Close control and data connections.
     */


    (0, _createClass3.default)(FTPContext, [{
        key: "close",
        value: function close() {
            this.log("Closing connections.");
            this._handler = undefined;
            this._task = undefined;
            this._partialResponse = "";
            this._closeSocket(this._socket);
            this._closeSocket(this._dataSocket);
            // Set a new socket instance to make reconnecting possible.
            this.socket = new Socket();
        }

        /** @type {Socket} */

    }, {
        key: "handle",


        /**
         * Send an FTP command and handle any response until the new task is resolved. This returns a Promise that
         * will hold whatever the handler passed on when resolving/rejecting its task.
         * 
         * @param {string} command
         * @param {ResponseHandler} handler
         * @returns {Promise<any>}
         */
        value: function handle(command, handler) {
            var _this = this;

            if (this._handler !== undefined) {
                this.close();
                throw new Error("There is still a task running. Did you forget to use '.then()' or 'await'?");
            }
            return new _promise2.default(function (resolvePromise, rejectPromise) {
                _this._handler = handler;
                _this._task = {
                    // When resolving or rejecting we also want the handler
                    // to no longer receive any responses or errors.
                    resolve: function resolve() {
                        _this._handler = undefined;
                        resolvePromise.apply(undefined, arguments);
                    },
                    reject: function reject() {
                        _this._handler = undefined;
                        rejectPromise.apply(undefined, arguments);
                    }
                };
                if (command !== undefined) {
                    _this.send(command);
                }
            });
        }

        /**
         * Send an FTP command without waiting for or handling the result.
         * 
         * @param {string} command
         */

    }, {
        key: "send",
        value: function send(command) {
            // Don't log passwords.
            var message = command.startsWith("PASS") ? "> PASS ###" : "> " + command;
            this.log(message);
            this._socket.write(command + "\r\n", this.encoding);
        }

        /**
         * Log message if set to be verbose.
         * 
         * @param {string} message 
         */

    }, {
        key: "log",
        value: function log(message) {
            if (this.verbose) {
                console.log(message);
            }
        }

        /**
         * Suspend timeout on the control socket connection. This can be useful if
         * a timeout should be caught by the current data connection instead of the 
         * control connection that sits idle during transfers anyway.
         * 
         * @param {boolean} suspended 
         */

    }, {
        key: "suspendControlTimeout",
        value: function suspendControlTimeout(suspended) {
            this.socket.setTimeout(suspended ? 0 : this._timeout);
        }

        /**
         * Handle incoming data on the control socket.
         * 
         * @private
         * @param {Buffer} data 
         */

    }, {
        key: "_onControlSocketData",
        value: function _onControlSocketData(data) {
            var response = data.toString(this.encoding).trim();
            this.log("< " + response);
            // This response might complete an earlier partial response.
            response = this._partialResponse + response;
            var parsed = parseControlResponse(response);
            // Remember any incomplete remainder.
            this._partialResponse = parsed.rest;
            // Each response group is passed along individually.
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = (0, _getIterator3.default)(parsed.messages), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var message = _step.value;

                    var code = parseInt(message.substr(0, 3), 10);
                    this._passToHandler({ code: code, message: message });
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator.return) {
                        _iterator.return();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        }

        /**
         * Send the current handler a response. This is usually a control socket response
         * or a socket event, like an error or timeout.
         * 
         * @private
         * @param {Object} response 
         */

    }, {
        key: "_passToHandler",
        value: function _passToHandler(response) {
            if (this._handler) {
                this._handler(response, this._task);
            }
        }

        /**
         * Send an error to the current handler and close all connections.
         * 
         * @private
         * @param {*} error 
         */

    }, {
        key: "_closeWithError",
        value: function _closeWithError(error) {
            this._passToHandler({ error: error });
            this.close();
        }

        /**
         * Close a socket.
         * 
         * @private
         * @param {(Socket | undefined)} socket 
         */

    }, {
        key: "_closeSocket",
        value: function _closeSocket(socket) {
            if (socket) {
                socket.destroy();
                this._removeSocketListeners(socket);
            }
        }

        /**
         * Setup all error handlers for a socket.
         * 
         * @private
         * @param {Socket} socket 
         * @param {string} identifier 
         */

    }, {
        key: "_setupErrorHandlers",
        value: function _setupErrorHandlers(socket, identifier) {
            var _this2 = this;

            socket.once("error", function (error) {
                return _this2._closeWithError({ error: error, ftpSocket: identifier });
            });
            socket.once("timeout", function () {
                return _this2._closeWithError({ info: "socket timeout", ftpSocket: identifier });
            });
            socket.once("close", function (hadError) {
                if (hadError) {
                    _this2._closeWithError({ info: "socket closed due to transmission error", ftpSocket: identifier });
                }
            });
        }

        /**
         * Remove all default listeners for socket.
         * 
         * @private
         * @param {Socket} socket 
         */

    }, {
        key: "_removeSocketListeners",
        value: function _removeSocketListeners(socket) {
            // socket.removeAllListeners() without name doesn't work: https://github.com/nodejs/node/issues/20923
            socket.removeAllListeners("timeout");
            socket.removeAllListeners("data");
            socket.removeAllListeners("error");
            socket.removeAllListeners("close");
        }
    }, {
        key: "socket",
        get: function get() {
            return this._socket;
        }

        /**
         * Set the socket for the control connection. This will only close the current control socket
         * if the new one is set to `undefined` because you're most likely to be upgrading an existing
         * control connection that continues to be used.
         * 
         * @type {Socket}
         */
        ,
        set: function set(socket) {
            var _this3 = this;

            // No data socket should be open in any case where the control socket is set or upgraded.
            this.dataSocket = undefined;
            if (this._socket) {
                this._removeSocketListeners(this._socket);
            }
            if (socket) {
                socket.setKeepAlive(true);
                socket.setTimeout(this._timeout);
                socket.on("data", function (data) {
                    return _this3._onControlSocketData(data);
                });
                this._setupErrorHandlers(socket, "control");
            } else {
                this._closeSocket(this._socket);
            }
            this._socket = socket;
        }

        /** @type {(Socket | undefined)} */

    }, {
        key: "dataSocket",
        get: function get() {
            return this._dataSocket;
        }

        /**
         * Set the socket for the data connection. This will automatically close the former data socket.
         * 
         * @type {(Socket | undefined)} 
         **/
        ,
        set: function set(socket) {
            this._closeSocket(this._dataSocket);
            if (socket) {
                socket.setTimeout(this._timeout);
                this._setupErrorHandlers(socket, "data");
            }
            this._dataSocket = socket;
        }

        /**
         * Return true if the control socket is using TLS. This does not mean that a session
         * has already been negotiated.
         * 
         * @returns {boolean}
         */

    }, {
        key: "hasTLS",
        get: function get() {
            //@ts-ignore that not every socket has property encrypted.
            return this._socket && this._socket.encrypted === true;
        }
    }]);
    return FTPContext;
}();