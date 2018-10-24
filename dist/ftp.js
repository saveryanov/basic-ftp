"use strict";

var _assign = require("babel-runtime/core-js/object/assign");

var _assign2 = _interopRequireDefault(_assign);

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require("babel-runtime/core-js/get-iterator");

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _map = require("babel-runtime/core-js/map");

var _map2 = _interopRequireDefault(_map);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

/**
 * Prepare a data socket using passive mode over IPv6.
 * 
 * @param {Client} client
 * @returns {Promise<PositiveResponse>}
 */
var enterPassiveModeIPv6 = function () {
    var _ref17 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee17(client) {
        var res, port, controlHost;
        return _regenerator2.default.wrap(function _callee17$(_context17) {
            while (1) {
                switch (_context17.prev = _context17.next) {
                    case 0:
                        _context17.next = 2;
                        return client.send("EPSV");

                    case 2:
                        res = _context17.sent;
                        port = parseIPv6PasvResponse(res.message);

                        if (port) {
                            _context17.next = 6;
                            break;
                        }

                        throw new Error("Can't parse EPSV response: " + res.message);

                    case 6:
                        controlHost = client.ftp.socket.remoteAddress;
                        _context17.next = 9;
                        return connectForPassiveTransfer(controlHost, port, client.ftp);

                    case 9:
                        return _context17.abrupt("return", res);

                    case 10:
                    case "end":
                        return _context17.stop();
                }
            }
        }, _callee17, this);
    }));

    return function enterPassiveModeIPv6(_x25) {
        return _ref17.apply(this, arguments);
    };
}();

/**
 * Parse an EPSV response. Returns only the port as in EPSV the host of the control connection is used.
 * 
 * @param {string} message
 * @returns {number} port
 */


/**
 * Prepare a data socket using passive mode over IPv4.
 * 
 * @param {Client} client
 * @returns {Promise<PositiveResponse>}
 */
var enterPassiveModeIPv4 = function () {
    var _ref18 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee18(client) {
        var res, target;
        return _regenerator2.default.wrap(function _callee18$(_context18) {
            while (1) {
                switch (_context18.prev = _context18.next) {
                    case 0:
                        _context18.next = 2;
                        return client.send("PASV");

                    case 2:
                        res = _context18.sent;
                        target = parseIPv4PasvResponse(res.message);

                        if (target) {
                            _context18.next = 6;
                            break;
                        }

                        throw new Error("Can't parse PASV response: " + res.message);

                    case 6:
                        // If the host in the PASV response has a local address while the control connection hasn't,
                        // we assume a NAT issue and use the IP of the control connection as the target for the data connection.
                        // We can't always perform this replacement because it's possible (although unlikely) that the FTP server
                        // indeed uses a different host for data connections.
                        if (ipIsPrivateV4Address(target.host) && !ipIsPrivateV4Address(client.ftp.socket.remoteAddress)) {
                            target.host = client.ftp.socket.remoteAddress;
                        }
                        _context18.next = 9;
                        return connectForPassiveTransfer(target.host, target.port, client.ftp);

                    case 9:
                        return _context18.abrupt("return", res);

                    case 10:
                    case "end":
                        return _context18.stop();
                }
            }
        }, _callee18, this);
    }));

    return function enterPassiveModeIPv4(_x26) {
        return _ref18.apply(this, arguments);
    };
}();

/**
 * Parse a PASV response.
 * 
 * @param {string} message
 * @returns {{host: string, port: number}}
 */


/**
 * Upload the contents of a local directory to the working directory. This will overwrite
 * existing files and reuse existing directories.
 * 
 * @param {string} localDirPath 
 */
var uploadDirContents = function () {
    var _ref19 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee19(client, localDirPath) {
        var files, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, file, fullPath, stats;

        return _regenerator2.default.wrap(function _callee19$(_context19) {
            while (1) {
                switch (_context19.prev = _context19.next) {
                    case 0:
                        _context19.next = 2;
                        return fsReadDir(localDirPath);

                    case 2:
                        files = _context19.sent;
                        _iteratorNormalCompletion5 = true;
                        _didIteratorError5 = false;
                        _iteratorError5 = undefined;
                        _context19.prev = 6;
                        _iterator5 = (0, _getIterator3.default)(files);

                    case 8:
                        if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                            _context19.next = 29;
                            break;
                        }

                        file = _step5.value;
                        fullPath = path.join(localDirPath, file);
                        _context19.next = 13;
                        return fsStat(fullPath);

                    case 13:
                        stats = _context19.sent;

                        if (!stats.isFile()) {
                            _context19.next = 19;
                            break;
                        }

                        _context19.next = 17;
                        return client.upload(fs.createReadStream(fullPath), file);

                    case 17:
                        _context19.next = 26;
                        break;

                    case 19:
                        if (!stats.isDirectory()) {
                            _context19.next = 26;
                            break;
                        }

                        _context19.next = 22;
                        return openDir(client, file);

                    case 22:
                        _context19.next = 24;
                        return uploadDirContents(client, fullPath);

                    case 24:
                        _context19.next = 26;
                        return client.send("CDUP");

                    case 26:
                        _iteratorNormalCompletion5 = true;
                        _context19.next = 8;
                        break;

                    case 29:
                        _context19.next = 35;
                        break;

                    case 31:
                        _context19.prev = 31;
                        _context19.t0 = _context19["catch"](6);
                        _didIteratorError5 = true;
                        _iteratorError5 = _context19.t0;

                    case 35:
                        _context19.prev = 35;
                        _context19.prev = 36;

                        if (!_iteratorNormalCompletion5 && _iterator5.return) {
                            _iterator5.return();
                        }

                    case 38:
                        _context19.prev = 38;

                        if (!_didIteratorError5) {
                            _context19.next = 41;
                            break;
                        }

                        throw _iteratorError5;

                    case 41:
                        return _context19.finish(38);

                    case 42:
                        return _context19.finish(35);

                    case 43:
                    case "end":
                        return _context19.stop();
                }
            }
        }, _callee19, this, [[6, 31, 35, 43], [36,, 38, 42]]);
    }));

    return function uploadDirContents(_x29, _x30) {
        return _ref19.apply(this, arguments);
    };
}();

/**
 * Try to create a directory and enter it. This will not raise an exception if the directory
 * couldn't be created if for example it already exists.
 * 
 * @param {Client} client 
 * @param {string} dirName 
 */


var openDir = function () {
    var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee20(client, dirName) {
        return _regenerator2.default.wrap(function _callee20$(_context20) {
            while (1) {
                switch (_context20.prev = _context20.next) {
                    case 0:
                        _context20.next = 2;
                        return client.send("MKD " + dirName, true);

                    case 2:
                        _context20.next = 4;
                        return client.cd(dirName);

                    case 4:
                    case "end":
                        return _context20.stop();
                }
            }
        }, _callee20, this);
    }));

    return function openDir(_x31, _x32) {
        return _ref20.apply(this, arguments);
    };
}();

var ensureLocalDirectory = function () {
    var _ref21 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee21(path) {
        return _regenerator2.default.wrap(function _callee21$(_context21) {
            while (1) {
                switch (_context21.prev = _context21.next) {
                    case 0:
                        _context21.prev = 0;
                        _context21.next = 3;
                        return fsStat(path);

                    case 3:
                        _context21.next = 9;
                        break;

                    case 5:
                        _context21.prev = 5;
                        _context21.t0 = _context21["catch"](0);
                        _context21.next = 9;
                        return fsMkDir(path);

                    case 9:
                    case "end":
                        return _context21.stop();
                }
            }
        }, _callee21, this, [[0, 5]]);
    }));

    return function ensureLocalDirectory(_x33) {
        return _ref21.apply(this, arguments);
    };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var net = require("net");
var tls = require("tls");
var fs = require("fs");
var path = require("path");
const promisify = f => (...args) => new Promise((a,b)=>f(...args, (err, res) => err ? b(err) : a(res)));
var parseListAutoDetect = require("./parseList");
var nullObject = require("./nullObject");
var FTPContext = require("./FtpContext");
var FileInfo = require("./FileInfo");
var StringWriter = require("./StringWriter");
var ProgressTracker = require("./ProgressTracker");

var fsReadDir = promisify(fs.readdir);
var fsMkDir = promisify(fs.mkdir);
var fsStat = promisify(fs.stat);

/**
 * @typedef {Object} PositiveResponse
 * @property {number} code  The FTP return code parsed from the FTP return message.
 * @property {string} message  The whole unparsed FTP return message.
 */

/**
 * @typedef {Object} NegativeResponse
 * @property {Object|string} error  The error description.
 * 
 * Negative responses are usually thrown as exceptions, not returned as values.
 */

/**
 * Client offers an API to interact with an FTP server.
 */

var Client = function () {

    /**
     * Instantiate an FTP client.
     * 
     * @param {number} [timeout=30000]  Timeout in milliseconds, use 0 for no timeout.
     */
    function Client() {
        var timeout = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30000;
        (0, _classCallCheck3.default)(this, Client);

        this.ftp = new FTPContext(timeout);
        this.prepareTransfer = enterFirstCompatibleMode(enterPassiveModeIPv6, enterPassiveModeIPv4);
        this.parseList = parseListAutoDetect;
        this._progressTracker = new ProgressTracker();
    }

    /**
     * Close all connections. You may continue using this client instance and reconnect again.
     */


    (0, _createClass3.default)(Client, [{
        key: "close",
        value: function close() {
            this.ftp.close();
            this._progressTracker.stop();
        }

        /**
         * Connect to an FTP server.
         * 
         * @param {string} [host=localhost]  Host the client should connect to.
         * @param {number} [port=21]  Port the client should connect to.
         * @returns {Promise<PositiveResponse>}
         */

    }, {
        key: "connect",
        value: function connect() {
            var _this = this;

            var host = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "localhost";
            var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 21;

            this.ftp.socket.connect({
                host: host,
                port: port,
                family: this.ftp.ipFamily
            }, function () {
                return _this.ftp.log("Connected to " + describeAddress(_this.ftp.socket));
            });
            return this.ftp.handle(undefined, function (res, task) {
                if (positiveCompletion(res.code)) {
                    task.resolve(res);
                } else {
                    // Reject all other codes, including 120 "Service ready in nnn minutes".
                    task.reject(res);
                }
            });
        }

        /**
         * Send an FTP command.
         * 
         * If successful it will return a response object that contains the return code as well 
         * as the whole message. Ignore FTP error codes if you don't want an exception to be thrown 
         * if an FTP command didn't succeed.
         * 
         * @param {string} command  FTP command to send.
         * @param {boolean} [ignoreErrorCodes=false]  Whether to ignore FTP error codes in result.
         * @returns {Promise<PositiveResponse>}
         */

    }, {
        key: "send",
        value: function send(command) {
            var ignoreErrorCodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return this.ftp.handle(command, function (res, task) {
                var success = res.code >= 200 && res.code < 400;
                if (success || res.code && ignoreErrorCodes) {
                    task.resolve(res);
                } else {
                    task.reject(res);
                }
            });
        }

        /**
         * Upgrade the current socket connection to TLS.
         * 
         * @param {tls.ConnectionOptions} [options={}]  TLS options as in `tls.connect(options)`
         * @param {string} [command="AUTH TLS"]  Set the authentication command, e.g. "AUTH SSL" instead of "AUTH TLS".
         * @returns {Promise<PositiveResponse>}
         */

    }, {
        key: "useTLS",
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var command = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "AUTH TLS";
                var ret;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this.send(command);

                            case 2:
                                ret = _context.sent;
                                _context.next = 5;
                                return upgradeSocket(this.ftp.socket, options);

                            case 5:
                                this.ftp.socket = _context.sent;

                                this.ftp.tlsOptions = options; // Keep the TLS options for later data connections that should use the same options.
                                this.ftp.log("Control socket is using: " + describeTLS(this.ftp.socket));
                                return _context.abrupt("return", ret);

                            case 9:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function useTLS() {
                return _ref.apply(this, arguments);
            }

            return useTLS;
        }()

        /**
         * Login a user with a password.
         * 
         * @param {string} [user="anonymous"]  Username to use for login.
         * @param {string} [password="guest"]  Password to use for login.
         * @returns {Promise<PositiveResponse>}
         */

    }, {
        key: "login",
        value: function login() {
            var _this2 = this;

            var user = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "anonymous";
            var password = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "guest";

            this.ftp.log("Login security: " + describeTLS(this.ftp.socket));
            return this.ftp.handle("USER " + user, function (res, task) {
                if (positiveCompletion(res.code)) {
                    // User logged in proceed OR Command superfluous
                    task.resolve(res);
                } else if (res.code === 331) {
                    // User name okay, need password
                    _this2.ftp.send("PASS " + password);
                } else {
                    // Also report error on 332 (Need account)
                    task.reject(res);
                }
            });
        }

        /**
         * Set the usual default settings.
         * 
         * Settings used:
         * * Binary mode (TYPE I)
         * * File structure (STRU F)
         * * Additional settings for FTPS (PBSZ 0, PROT P)
         * 
         * @returns {Promise<void>}
         */

    }, {
        key: "useDefaultSettings",
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this.send("TYPE I");

                            case 2:
                                _context2.next = 4;
                                return this.send("STRU F");

                            case 4:
                                if (!this.ftp.hasTLS) {
                                    _context2.next = 9;
                                    break;
                                }

                                _context2.next = 7;
                                return this.send("PBSZ 0");

                            case 7:
                                _context2.next = 9;
                                return this.send("PROT P");

                            case 9:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function useDefaultSettings() {
                return _ref2.apply(this, arguments);
            }

            return useDefaultSettings;
        }()

        /**
         * Convenience method that calls `connect`, `useTLS`, `login` and `useDefaultSettings`.
         * 
         * @typedef {Object} AccessOptions
         * @property {string} [host]  Host the client should connect to.
         * @property {number} [port]  Port the client should connect to.
         * @property {string} [user]  Username to use for login.
         * @property {string} [password]  Password to use for login.
         * @property {boolean} [secure]  Use explicit FTPS over TLS.
         * @property {tls.ConnectionOptions} [secureOptions]  TLS options as in `tls.connect(options)`
         * @param {AccessOptions} options
         * @returns {Promise<PositiveResponse>} The response after initial connect.
         */

    }, {
        key: "access",
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                var welcome;
                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this.connect(options.host, options.port);

                            case 2:
                                welcome = _context3.sent;

                                if (!(options.secure === true)) {
                                    _context3.next = 6;
                                    break;
                                }

                                _context3.next = 6;
                                return this.useTLS(options.secureOptions);

                            case 6:
                                _context3.next = 8;
                                return this.login(options.user, options.password);

                            case 8:
                                _context3.next = 10;
                                return this.useDefaultSettings();

                            case 10:
                                return _context3.abrupt("return", welcome);

                            case 11:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function access() {
                return _ref3.apply(this, arguments);
            }

            return access;
        }()

        /**
         * Set the working directory.
         * 
         * @param {string} path
         * @returns {Promise<PositiveResponse>} 
         */

    }, {
        key: "cd",
        value: function cd(path) {
            return this.send("CWD " + path);
        }

        /**
         * Get the current working directory.
         * 
         * @returns {Promise<string>}
         */

    }, {
        key: "pwd",
        value: function () {
            var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                var res;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this.send("PWD");

                            case 2:
                                res = _context4.sent;
                                return _context4.abrupt("return", res.message.match(/"(.+)"/)[1]);

                            case 4:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function pwd() {
                return _ref4.apply(this, arguments);
            }

            return pwd;
        }()

        /**
         * Get a description of supported features.
         * 
         * This sends the FEAT command and parses the result into a Map where keys correspond to available commands
         * and values hold further information. Be aware that your FTP servers might not support this
         * command in which case this method will not throw an exception but just return an empty Map.
         * 
         * @returns {Promise<Map<string, string>>} a Map, keys hold commands and values further options.
         */

    }, {
        key: "features",
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
                var res, features;
                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this.send("FEAT", true);

                            case 2:
                                res = _context5.sent;
                                features = new _map2.default();
                                // Not supporting any special features will be reported with a single line.

                                if (res.code < 400 && isMultiline(res.message)) {
                                    // The first and last line wrap the multiline response, ignore them.
                                    res.message.split("\n").slice(1, -1).forEach(function (line) {
                                        // A typical lines looks like: " REST STREAM" or " MDTM". 
                                        // Servers might not use an indentation though.
                                        var entry = line.trim().split(" ");
                                        features.set(entry[0], entry[1] || "");
                                    });
                                }
                                return _context5.abrupt("return", features);

                            case 6:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function features() {
                return _ref5.apply(this, arguments);
            }

            return features;
        }()

        /**
         * Get the size of a file.
         * 
         * @param {string} filename  Name of the file in the current working directory.
         * @returns {Promise<number>}
         */

    }, {
        key: "size",
        value: function () {
            var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(filename) {
                var res, size;
                return _regenerator2.default.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:
                                _context6.next = 2;
                                return this.send("SIZE " + filename);

                            case 2:
                                res = _context6.sent;

                                // The size is part of the response message, for example: "213 555555"
                                size = res.message.match(/^\d\d\d (\d+)/)[1];
                                return _context6.abrupt("return", parseInt(size, 10));

                            case 5:
                            case "end":
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function size(_x10) {
                return _ref6.apply(this, arguments);
            }

            return size;
        }()

        /**
         * Rename a file. 
         * 
         * Depending on the FTP server this might also be used to move a file from one 
         * directory to another by providing full paths.
         * 
         * @param {string} path 
         * @param {string} newPath 
         * @returns {Promise<PositiveResponse>} response of second command (RNTO)
         */

    }, {
        key: "rename",
        value: function () {
            var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(path, newPath) {
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.send("RNFR " + path);

                            case 2:
                                _context7.next = 4;
                                return this.send("RNTO " + newPath);

                            case 4:
                                return _context7.abrupt("return", _context7.sent);

                            case 5:
                            case "end":
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function rename(_x11, _x12) {
                return _ref7.apply(this, arguments);
            }

            return rename;
        }()

        /**
         * Remove a file from the current working directory.
         * 
         * You can ignore FTP error return codes which won't throw an exception if e.g.
         * the file doesn't exist.
         * 
         * @param {string} filename  Name of the file to remove.
         * @param {boolean} [ignoreErrorCodes=false]  Ignore error return codes.
         * @returns {Promise<PositiveResponse>}
         */

    }, {
        key: "remove",
        value: function remove(filename) {
            var ignoreErrorCodes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return this.send("DELE " + filename, ignoreErrorCodes);
        }

        /**
         * Report transfer progress for any upload or download to a given handler.
         * 
         * This will also reset the overall transfer counter that can be used for multiple transfers. You can
         * also pass `undefined` as a handler to stop reporting to an earlier one.
         * 
         * @param {((info: import("./ProgressTracker").ProgressInfo) => void)} [handler=undefined]  Handler function to call on transfer progress.
         */

    }, {
        key: "trackProgress",
        value: function trackProgress(handler) {
            this._progressTracker.bytesOverall = 0;
            this._progressTracker.reportTo(handler);
        }

        /**
         * Upload data from a readable stream and store it as a file with a given filename in the current working directory. 
         * 
         * @param {import("stream").Readable} readableStream  The stream to read from.
         * @param {string} remoteFilename  The filename of the remote file to write to.
         * @returns {Promise<PositiveResponse>}
         */

    }, {
        key: "upload",
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(readableStream, remoteFilename) {
                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                _context8.next = 2;
                                return this.prepareTransfer(this);

                            case 2:
                                return _context8.abrupt("return", _upload(this.ftp, this._progressTracker, readableStream, remoteFilename));

                            case 3:
                            case "end":
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function upload(_x14, _x15) {
                return _ref8.apply(this, arguments);
            }

            return upload;
        }()

        /**
         * Download a file with a given filename from the current working directory 
         * and pipe its data to a writable stream. You may optionally start at a specific 
         * offset, for example to resume a cancelled transfer.
         * 
         * @param {import("stream").Writable} writableStream  The stream to write to.
         * @param {string} remoteFilename  The name of the remote file to read from.
         * @param {number} [startAt=0]  The offset to start at.
         * @returns {Promise<PositiveResponse>}
         */

    }, {
        key: "download",
        value: function () {
            var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(writableStream, remoteFilename) {
                var startAt = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
                var command;
                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                _context9.next = 2;
                                return this.prepareTransfer(this);

                            case 2:
                                command = startAt > 0 ? "REST " + startAt : "RETR " + remoteFilename;
                                return _context9.abrupt("return", _download(this.ftp, this._progressTracker, writableStream, command, remoteFilename));

                            case 4:
                            case "end":
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function download(_x17, _x18) {
                return _ref9.apply(this, arguments);
            }

            return download;
        }()

        /**
         * List files and directories in the current working directory.
         * 
         * @returns {Promise<FileInfo[]>}
         */

    }, {
        key: "list",
        value: function () {
            var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10() {
                var writable, progressTracker;
                return _regenerator2.default.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                _context10.next = 2;
                                return this.prepareTransfer(this);

                            case 2:
                                writable = new StringWriter(this.ftp.encoding);
                                progressTracker = nullObject(); // Don't track progress of list transfers.
                                //@ts-ignore that progressTracker is not really of type ProgressTracker.

                                _context10.next = 6;
                                return _download(this.ftp, progressTracker, writable, "LIST");

                            case 6:
                                this.ftp.log(writable.text);
                                return _context10.abrupt("return", this.parseList(writable.text));

                            case 8:
                            case "end":
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function list() {
                return _ref10.apply(this, arguments);
            }

            return list;
        }()

        /**
         * Remove a directory and all of its content.
         * 
         * After successfull completion the current working directory will be the parent
         * of the removed directory if possible.
         * 
         * @param {string} remoteDirPath  The path of the remote directory to delete.
         * @example client.removeDir("foo") // Remove directory 'foo' using a relative path.
         * @example client.removeDir("foo/bar") // Remove directory 'bar' using a relative path.
         * @example client.removeDir("/foo/bar") // Remove directory 'bar' using an absolute path.
         * @example client.removeDir("/") // Remove everything.
         * @returns {Promise<void>}
         */

    }, {
        key: "removeDir",
        value: function () {
            var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(remoteDirPath) {
                var workingDir;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                _context11.next = 2;
                                return this.cd(remoteDirPath);

                            case 2:
                                _context11.next = 4;
                                return this.clearWorkingDir();

                            case 4:
                                _context11.next = 6;
                                return this.pwd();

                            case 6:
                                workingDir = _context11.sent;

                                if (!(workingDir !== "/")) {
                                    _context11.next = 12;
                                    break;
                                }

                                _context11.next = 10;
                                return this.send("CDUP");

                            case 10:
                                _context11.next = 12;
                                return this.send("RMD " + remoteDirPath);

                            case 12:
                            case "end":
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function removeDir(_x19) {
                return _ref11.apply(this, arguments);
            }

            return removeDir;
        }()

        /**
         * Remove all files and directories in the working directory without removing
         * the working directory itself.
         * 
         * @returns {Promise<void>}
         */

    }, {
        key: "clearWorkingDir",
        value: function () {
            var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12() {
                var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, file;

                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                _iteratorNormalCompletion = true;
                                _didIteratorError = false;
                                _iteratorError = undefined;
                                _context12.prev = 3;
                                _context12.t0 = _getIterator3.default;
                                _context12.next = 7;
                                return this.list();

                            case 7:
                                _context12.t1 = _context12.sent;
                                _iterator = (0, _context12.t0)(_context12.t1);

                            case 9:
                                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                    _context12.next = 27;
                                    break;
                                }

                                file = _step.value;

                                if (!file.isDirectory) {
                                    _context12.next = 22;
                                    break;
                                }

                                _context12.next = 14;
                                return this.cd(file.name);

                            case 14:
                                _context12.next = 16;
                                return this.clearWorkingDir();

                            case 16:
                                _context12.next = 18;
                                return this.send("CDUP");

                            case 18:
                                _context12.next = 20;
                                return this.send("RMD " + file.name);

                            case 20:
                                _context12.next = 24;
                                break;

                            case 22:
                                _context12.next = 24;
                                return this.send("DELE " + file.name);

                            case 24:
                                _iteratorNormalCompletion = true;
                                _context12.next = 9;
                                break;

                            case 27:
                                _context12.next = 33;
                                break;

                            case 29:
                                _context12.prev = 29;
                                _context12.t2 = _context12["catch"](3);
                                _didIteratorError = true;
                                _iteratorError = _context12.t2;

                            case 33:
                                _context12.prev = 33;
                                _context12.prev = 34;

                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }

                            case 36:
                                _context12.prev = 36;

                                if (!_didIteratorError) {
                                    _context12.next = 39;
                                    break;
                                }

                                throw _iteratorError;

                            case 39:
                                return _context12.finish(36);

                            case 40:
                                return _context12.finish(33);

                            case 41:
                            case "end":
                                return _context12.stop();
                        }
                    }
                }, _callee12, this, [[3, 29, 33, 41], [34,, 36, 40]]);
            }));

            function clearWorkingDir() {
                return _ref12.apply(this, arguments);
            }

            return clearWorkingDir;
        }()

        /**
         * Upload the contents of a local directory to the working directory. 
         * 
         * You can optionally provide a `remoteDirName` to put the contents inside a directory which 
         * will be created if necessary. This will overwrite existing files with the same names and 
         * reuse existing directories. Unrelated files and directories will remain untouched.
         * 
         * @param {string} localDirPath  A local path, e.g. "foo/bar" or "../test"
         * @param {string} [remoteDirName]  The name of the remote directory. If undefined, directory contents will be uploaded to the working directory.
         * @returns {Promise<void>}
         */

    }, {
        key: "uploadDir",
        value: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(localDirPath) {
                var remoteDirName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                if (!(remoteDirName !== undefined)) {
                                    _context13.next = 5;
                                    break;
                                }

                                if (!(remoteDirName.indexOf("/") !== -1)) {
                                    _context13.next = 3;
                                    break;
                                }

                                throw new Error("Path provided '" + remoteDirName + "' instead of single directory name.");

                            case 3:
                                _context13.next = 5;
                                return openDir(this, remoteDirName);

                            case 5:
                                _context13.next = 7;
                                return uploadDirContents(this, localDirPath);

                            case 7:
                                if (!(remoteDirName !== undefined)) {
                                    _context13.next = 10;
                                    break;
                                }

                                _context13.next = 10;
                                return this.send("CDUP");

                            case 10:
                            case "end":
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function uploadDir(_x21) {
                return _ref13.apply(this, arguments);
            }

            return uploadDir;
        }()

        /**
         * Download all files and directories of the working directory to a local directory.
         * 
         * @param {string} localDirPath  The local directory to download to.
         * @returns {Promise<void>}
         */

    }, {
        key: "downloadDir",
        value: function () {
            var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(localDirPath) {
                var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, file, localPath, writable;

                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                _context14.next = 2;
                                return ensureLocalDirectory(localDirPath);

                            case 2:
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context14.prev = 5;
                                _context14.t0 = _getIterator3.default;
                                _context14.next = 9;
                                return this.list();

                            case 9:
                                _context14.t1 = _context14.sent;
                                _iterator2 = (0, _context14.t0)(_context14.t1);

                            case 11:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                    _context14.next = 29;
                                    break;
                                }

                                file = _step2.value;
                                localPath = path.join(localDirPath, file.name);

                                if (!file.isDirectory) {
                                    _context14.next = 23;
                                    break;
                                }

                                _context14.next = 17;
                                return this.cd(file.name);

                            case 17:
                                _context14.next = 19;
                                return this.downloadDir(localPath);

                            case 19:
                                _context14.next = 21;
                                return this.send("CDUP");

                            case 21:
                                _context14.next = 26;
                                break;

                            case 23:
                                writable = fs.createWriteStream(localPath);
                                _context14.next = 26;
                                return this.download(writable, file.name);

                            case 26:
                                _iteratorNormalCompletion2 = true;
                                _context14.next = 11;
                                break;

                            case 29:
                                _context14.next = 35;
                                break;

                            case 31:
                                _context14.prev = 31;
                                _context14.t2 = _context14["catch"](5);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context14.t2;

                            case 35:
                                _context14.prev = 35;
                                _context14.prev = 36;

                                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                    _iterator2.return();
                                }

                            case 38:
                                _context14.prev = 38;

                                if (!_didIteratorError2) {
                                    _context14.next = 41;
                                    break;
                                }

                                throw _iteratorError2;

                            case 41:
                                return _context14.finish(38);

                            case 42:
                                return _context14.finish(35);

                            case 43:
                            case "end":
                                return _context14.stop();
                        }
                    }
                }, _callee14, this, [[5, 31, 35, 43], [36,, 38, 42]]);
            }));

            function downloadDir(_x22) {
                return _ref14.apply(this, arguments);
            }

            return downloadDir;
        }()

        /**
         * Make sure a given remote path exists, creating all directories as necessary.
         * This function also changes the current working directory to the given path.
         * 
         * @param {string} remoteDirPath 
         * @returns {Promise<void>}
         */

    }, {
        key: "ensureDir",
        value: function () {
            var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(remoteDirPath) {
                var names, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, name;

                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                if (!remoteDirPath.startsWith("/")) {
                                    _context15.next = 3;
                                    break;
                                }

                                _context15.next = 3;
                                return this.cd("/");

                            case 3:
                                names = remoteDirPath.split("/").filter(function (name) {
                                    return name !== "";
                                });
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context15.prev = 7;
                                _iterator3 = (0, _getIterator3.default)(names);

                            case 9:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                    _context15.next = 16;
                                    break;
                                }

                                name = _step3.value;
                                _context15.next = 13;
                                return openDir(this, name);

                            case 13:
                                _iteratorNormalCompletion3 = true;
                                _context15.next = 9;
                                break;

                            case 16:
                                _context15.next = 22;
                                break;

                            case 18:
                                _context15.prev = 18;
                                _context15.t0 = _context15["catch"](7);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context15.t0;

                            case 22:
                                _context15.prev = 22;
                                _context15.prev = 23;

                                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                    _iterator3.return();
                                }

                            case 25:
                                _context15.prev = 25;

                                if (!_didIteratorError3) {
                                    _context15.next = 28;
                                    break;
                                }

                                throw _iteratorError3;

                            case 28:
                                return _context15.finish(25);

                            case 29:
                                return _context15.finish(22);

                            case 30:
                            case "end":
                                return _context15.stop();
                        }
                    }
                }, _callee15, this, [[7, 18, 22, 30], [23,, 25, 29]]);
            }));

            function ensureDir(_x23) {
                return _ref15.apply(this, arguments);
            }

            return ensureDir;
        }()
    }]);
    return Client;
}();

/**
 * Resolves a given task if one party has provided a result and another one confirmed it.
 * 
 * This is used internally for all FTP transfers. For example when downloading, the server might confirm 
 * with "226 Transfer complete" when in fact the download on the data connection has not finished 
 * yet. With all transfers we make sure that a) the result arrived and b) has been confirmed by 
 * e.g. the control connection. We just don't know in which order this will happen.
 */


var TransferResolver = function () {

    /**
     * Instantiate a TransferResolver
     * @param {FTPContext} ftp 
     */
    function TransferResolver(ftp) {
        (0, _classCallCheck3.default)(this, TransferResolver);

        this.ftp = ftp;
        this.result = undefined;
        this.confirmed = false;
    }

    (0, _createClass3.default)(TransferResolver, [{
        key: "resolve",
        value: function resolve(task, result) {
            this.result = result;
            this._tryResolve(task);
        }
    }, {
        key: "confirm",
        value: function confirm(task) {
            this.confirmed = true;
            this._tryResolve(task);
        }
    }, {
        key: "reject",
        value: function reject(task, reason) {
            this.ftp.dataSocket = undefined;
            task.reject(reason);
        }
    }, {
        key: "_tryResolve",
        value: function _tryResolve(task) {
            if (this.confirmed && this.result !== undefined) {
                this.ftp.dataSocket = undefined;
                task.resolve(this.result);
            }
        }
    }]);
    return TransferResolver;
}();

module.exports = {
    Client: Client,
    FTPContext: FTPContext,
    FileInfo: FileInfo,
    // Expose some utilities for custom extensions:
    utils: {
        upgradeSocket: upgradeSocket,
        parseIPv4PasvResponse: parseIPv4PasvResponse,
        TransferResolver: TransferResolver
    }
    // enterFirstCompatibleMode,
    // enterPassiveModeIPv4,
    // enterPassiveModeIPv6,
};

/**
 * Return true if an FTP return code describes a positive completion. Often it's not
 * necessary to know which code it was specifically.
 * 
 * @param {number} code 
 * @returns {boolean}
 */
function positiveCompletion(code) {
    return code >= 200 && code < 300;
}

/**
 * Returns true if an FTP response line is the beginning of a multiline response.
 * 
 * @param {string} line 
 * @returns {boolean}
 */
function isMultiline(line) {
    return (/^\d\d\d-/.test(line)
    );
}

/**
 * Returns a string describing the encryption on a given socket instance.
 * 
 * @param {(net.Socket | tls.TLSSocket)} socket
 * @returns {string} 
 */
function describeTLS(socket) {
    if (socket instanceof tls.TLSSocket) {
        return socket.getProtocol();
    }
    return "No encryption";
}

/**
 * Returns a string describing the remote address of a socket.
 * 
 * @param {net.Socket} socket 
 * @returns {string}
 */
function describeAddress(socket) {
    if (socket.remoteFamily === "IPv6") {
        return "[" + socket.remoteAddress + "]:" + socket.remotePort;
    }
    return socket.remoteAddress + ":" + socket.remotePort;
}

/**
 * Upgrade a socket connection with TLS.
 * 
 * @param {net.Socket} socket 
 * @param {tls.ConnectionOptions} options Same options as in `tls.connect(options)`
 * @returns {Promise<tls.TLSSocket>}
 */
function upgradeSocket(socket, options) {
    return new _promise2.default(function (resolve, reject) {
        var tlsOptions = (0, _assign2.default)({}, options, {
            socket: socket // Establish the secure connection using an existing socket connection.
        });
        var tlsSocket = tls.connect(tlsOptions, function () {
            // Make sure the certificate is valid if an unauthorized one should be rejected.
            var expectCertificate = tlsOptions.rejectUnauthorized !== false;
            if (expectCertificate && !tlsSocket.authorized) {
                reject(tlsSocket.authorizationError);
            } else {
                // Remove error listener below.
                tlsSocket.removeAllListeners("error");
                resolve(tlsSocket);
            }
        }).once("error", function (error) {
            reject(error);
        });
    });
}

/**
 * Try all available transfer strategies and pick the first one that works. Update `client` to
 * use the working strategy for all successive transfer requests.
 * 
 * @param {((client: Client)=>Promise<PositiveResponse>)[]} strategies
 * @returns {(client: Client)=>Promise<PositiveResponse>} a function that will try the provided strategies.
 */
function enterFirstCompatibleMode() {
    for (var _len = arguments.length, strategies = Array(_len), _key = 0; _key < _len; _key++) {
        strategies[_key] = arguments[_key];
    }

    return function () {
        var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(client) {
            var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, strategy, res;

            return _regenerator2.default.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            client.ftp.log("Trying to find optimal transfer strategy...");
                            _iteratorNormalCompletion4 = true;
                            _didIteratorError4 = false;
                            _iteratorError4 = undefined;
                            _context16.prev = 4;
                            _iterator4 = (0, _getIterator3.default)(strategies);

                        case 6:
                            if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                _context16.next = 23;
                                break;
                            }

                            strategy = _step4.value;
                            _context16.prev = 8;
                            _context16.next = 11;
                            return strategy(client);

                        case 11:
                            res = _context16.sent;

                            client.ftp.log("Optimal transfer strategy found.");
                            client.prepareTransfer = strategy; // First strategy that works will be used from now on.
                            return _context16.abrupt("return", res);

                        case 17:
                            _context16.prev = 17;
                            _context16.t0 = _context16["catch"](8);

                            if (!_context16.t0.code) {
                                // Don't log out FTP response error again.
                                client.ftp.log(_context16.t0.toString());
                            }

                        case 20:
                            _iteratorNormalCompletion4 = true;
                            _context16.next = 6;
                            break;

                        case 23:
                            _context16.next = 29;
                            break;

                        case 25:
                            _context16.prev = 25;
                            _context16.t1 = _context16["catch"](4);
                            _didIteratorError4 = true;
                            _iteratorError4 = _context16.t1;

                        case 29:
                            _context16.prev = 29;
                            _context16.prev = 30;

                            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                                _iterator4.return();
                            }

                        case 32:
                            _context16.prev = 32;

                            if (!_didIteratorError4) {
                                _context16.next = 35;
                                break;
                            }

                            throw _iteratorError4;

                        case 35:
                            return _context16.finish(32);

                        case 36:
                            return _context16.finish(29);

                        case 37:
                            throw new Error("None of the available transfer strategies work.");

                        case 38:
                        case "end":
                            return _context16.stop();
                    }
                }
            }, _callee16, this, [[4, 25, 29, 37], [8, 17], [30,, 32, 36]]);
        }));

        function autoDetect(_x24) {
            return _ref16.apply(this, arguments);
        }

        return autoDetect;
    }();
}function parseIPv6PasvResponse(message) {
    // Get port from EPSV response, e.g. "229 Entering Extended Passive Mode (|||6446|)"
    var groups = message.match(/\|{3}(.+)\|/);
    return groups[1] ? parseInt(groups[1], 10) : undefined;
}function parseIPv4PasvResponse(message) {
    // Get host and port from PASV response, e.g. "227 Entering Passive Mode (192,168,1,100,10,229)"
    var groups = message.match(/([-\d]+,[-\d]+,[-\d]+,[-\d]+),([-\d]+),([-\d]+)/);
    if (!groups || groups.length !== 4) {
        return undefined;
    }
    return {
        host: groups[1].replace(/,/g, "."),
        port: (parseInt(groups[2], 10) & 255) * 256 + (parseInt(groups[3], 10) & 255)
    };
}

/**
 * Returns true if an IP is a private address according to https://tools.ietf.org/html/rfc1918#section-3.
 * This will handle IPv4-mapped IPv6 addresses correctly but return false for all other IPv6 addresses.
 * 
 * @param {string} ip  The IP as a string, e.g. "192.168.0.1"
 * @returns {boolean} true if the ip is local.
 */
function ipIsPrivateV4Address() {
    var ip = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    // Handle IPv4-mapped IPv6 addresses like ::ffff:192.168.0.1
    if (ip.startsWith("::ffff:")) {
        ip = ip.substr(7); // Strip ::ffff: prefix
    }
    var octets = ip.split(".").map(function (o) {
        return parseInt(o, 10);
    });
    return octets[0] === 10 // 10.0.0.0 - 10.255.255.255
    || octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31 // 172.16.0.0 - 172.31.255.255
    || octets[0] === 192 && octets[1] === 168; // 192.168.0.0 - 192.168.255.255
}

function connectForPassiveTransfer(host, port, ftp) {
    return new _promise2.default(function (resolve, reject) {
        var handleConnErr = function handleConnErr(err) {
            reject("Can't open data connection in passive mode: " + err.message);
        };
        var socket = new net.Socket();
        socket.on("error", handleConnErr);
        socket.connect({ port: port, host: host, family: ftp.ipFamily }, function () {
            if (ftp.hasTLS) {
                socket = tls.connect((0, _assign2.default)({}, ftp.tlsOptions, {
                    // Upgrade the existing socket connection.
                    socket: socket,
                    // Reuse the TLS session negotiated earlier when the control connection
                    // was upgraded. Servers expect this because it provides additional
                    // security. If a completely new session would be negotiated, a hacker
                    // could guess the port and connect to the new data connection before we do
                    // by just starting his/her own TLS session.
                    session: ftp.socket.getSession()
                }));
                // It's the responsibility of the transfer task to wait until the
                // TLS socket issued the event 'secureConnect'. We can't do this
                // here because some servers will start upgrading after the
                // specific transfer request has been made. List and download don't
                // have to wait for this event because the server sends whenever it
                // is ready. But for upload this has to be taken into account,
                // see the details in the upload() function below. 
            }
            // Let the FTPContext listen to errors from now on, remove local handler.
            socket.removeListener("error", handleConnErr);
            ftp.dataSocket = socket;
            resolve();
        });
    });
}

/**
 * Upload stream data as a file. For example:
 * 
 * `upload(ftp, fs.createReadStream(localFilePath), remoteFilename)`
 * 
 * @param {FTPContext} ftp 
 * @param {ProgressTracker} progress
 * @param {import("stream").Readable} readableStream 
 * @param {string} remoteFilename 
 * @returns {Promise<PositiveResponse>}
 */
function _upload(ftp, progress, readableStream, remoteFilename) {
    var resolver = new TransferResolver(ftp);
    var command = "STOR " + remoteFilename;
    return ftp.handle(command, function (res, task) {
        if (res.code === 150 || res.code === 125) {
            // Ready to upload
            // If we are using TLS, we have to wait until the dataSocket issued
            // 'secureConnect'. If this hasn't happened yet, getCipher() returns undefined.
            // @ts-ignore that ftp.dataSocket might be just a Socket without getCipher()
            var canUpload = ftp.hasTLS === false || ftp.dataSocket.getCipher() !== undefined;
            conditionOrEvent(canUpload, ftp.dataSocket, "secureConnect", function () {
                ftp.log("Uploading to " + describeAddress(ftp.dataSocket) + " (" + describeTLS(ftp.dataSocket) + ")");
                // Let the data socket be in charge of tracking timeouts.
                // The control socket sits idle during this time anyway and might provoke
                // a timeout unnecessarily. The control connection will take care
                // of timeouts again once data transfer is complete or failed.
                ftp.suspendControlTimeout(true);
                progress.start(ftp.dataSocket, remoteFilename, "upload");
                readableStream.pipe(ftp.dataSocket).once("finish", function () {
                    ftp.dataSocket.destroy(); // Explicitly close/destroy the socket to signal the end.
                    ftp.suspendControlTimeout(false);
                    progress.updateAndStop();
                    resolver.confirm(task);
                });
            });
        } else if (positiveCompletion(res.code)) {
            // Transfer complete
            resolver.resolve(task, res.code);
        } else if (res.code >= 400 || res.error) {
            ftp.suspendControlTimeout(false);
            progress.updateAndStop();
            resolver.reject(task, res);
        }
    });
}

/**
 * Download data from the data connection. Used for downloading files and directory listings.
 * 
 * @param {FTPContext} ftp 
 * @param {ProgressTracker} progress
 * @param {import("stream").Writable} writableStream 
 * @param {string} command 
 * @param {string} [remoteFilename]
 * @returns {Promise<PositiveResponse>}
 */
function _download(ftp, progress, writableStream, command) {
    var remoteFilename = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : "";

    // It's possible that data transmission begins before the control socket
    // receives the announcement. Start listening for data immediately.
    ftp.dataSocket.pipe(writableStream);
    var resolver = new TransferResolver(ftp);
    return ftp.handle(command, function (res, task) {
        if (res.code === 150 || res.code === 125) {
            // Ready to download
            ftp.log("Downloading from " + describeAddress(ftp.dataSocket) + " (" + describeTLS(ftp.dataSocket) + ")");
            // Let the data connection be in charge of tracking timeouts during transfer.
            ftp.suspendControlTimeout(true);
            progress.start(ftp.dataSocket, remoteFilename, "download");
            // Confirm the transfer as soon as the data socket transmission ended.
            // It's possible, though, that the data transmission is complete before
            // the control socket receives the accouncement that it will begin.
            // Check if the data socket is not already closed.
            conditionOrEvent(ftp.dataSocket.destroyed, ftp.dataSocket, "end", function () {
                ftp.suspendControlTimeout(false);
                progress.updateAndStop();
                resolver.confirm(task);
            });
        } else if (res.code === 350) {
            // Restarting at startAt.
            ftp.send("RETR " + remoteFilename);
        } else if (positiveCompletion(res.code)) {
            // Transfer complete
            resolver.resolve(task, res.code);
        } else if (res.code >= 400 || res.error) {
            ftp.suspendControlTimeout(false);
            progress.updateAndStop();
            resolver.reject(task, res);
        }
    });
}

/**
 * Calls a function immediately if a condition is met or subscribes to an event and calls
 * it once the event is emitted.
 * 
 * @param {boolean} condition  The condition to test.
 * @param {*} emitter  The emitter to use if the condition is not met.
 * @param {string} eventName  The event to subscribe to if the condition is not met.
 * @param {() => any} action  The function to call.
 */
function conditionOrEvent(condition, emitter, eventName, action) {
    if (condition === true) {
        action();
    } else {
        emitter.once(eventName, function () {
            return action();
        });
    }
}