"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.FetchJSON = exports.FetchContent = exports.IsConnected = exports.Initialize = void 0;
var domains_1 = __importDefault(require("./domains"));
var Utilities = __importStar(require("./utilities"));
var instance = undefined;
// True when verbosity is enabled to check errors
var verbose = false;
var Initialize = function (options) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // Only initialize in cases where isn't initialized yet
        // Or in cases where is initialized and connected but forced to reinitialize
        if (instance == undefined || ((instance === null || instance === void 0 ? void 0 : instance.ipfsConnected) && (options === null || options === void 0 ? void 0 : options.forceInitialize))) {
            instance = new IPFSFetcher(options);
            verbose = (options === null || options === void 0 ? void 0 : options.verbose) || false;
        }
        return [2 /*return*/];
    });
}); };
exports.Initialize = Initialize;
var IsConnected = function () {
    return instance === null || instance === void 0 ? void 0 : instance.ipfsConnected;
};
exports.IsConnected = IsConnected;
// Wait for gateway connections before try fetch any content 
var waitLoop = function (callback) {
    // If connected return
    if (instance === null || instance === void 0 ? void 0 : instance.ipfsConnected) {
        callback();
        return;
    }
    // Try again if not connected.
    setTimeout(function () {
        if (instance)
            waitLoop(callback);
    }, 100);
};
var IPFSFetcher = /** @class */ (function () {
    function IPFSFetcher(options) {
        var _this = this;
        // True when sucessfully connected with at least two gateways
        this.ipfsConnected = false;
        this.gatewaysFetched = [];
        if (verbose)
            console.log('-- IPFS Starting connection process --');
        var domains = (options === null || options === void 0 ? void 0 : options.customDomains) ? options.customDomains : domains_1["default"];
        domains.forEach(function (gatewayPath) {
            var dateBefore = Date.now();
            // Test each gateway against a 5sec timeout
            var timeout;
            Promise.any([
                fetch(gatewayPath.replace(':hash', 'bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m'), { mode: 'cors', method: 'HEAD' }),
                new Promise(function (resolve, reject) { timeout = setTimeout(reject, 5000); })
            ]).then(function (response) {
                if (
                // Fetch returned successfully
                response.ok
                // In case of customDomains IPFSSubdomain security verification is disabled
                // TODO This line was commented due to apparently there are not so much public domains that uses subdomains
                // customDomains ? true : isIPFS.ipfsSubdomain(response.url)
                ) {
                    clearTimeout(timeout);
                    return;
                }
                else {
                    clearTimeout(timeout);
                    throw Error(response.statusText);
                }
            })
                .then(function () {
                // Concat the new fetched gateway and make a fester response sort
                _this.gatewaysFetched = _this.gatewaysFetched.concat({ path: gatewayPath, errors: 0, response: Date.now() - dateBefore })
                    .sort(function (a, b) { return a.response - b.response; });
                if (verbose)
                    console.log('Gateway connected: ', _this.gatewaysFetched.length, '-', gatewayPath);
                // If more than 3 gateways have succeded, then consider IPFS connected and ready
                if (_this.gatewaysFetched.length > (options.minimumGateways || 0) && !_this.ipfsConnected) {
                    if (verbose)
                        console.log('-- IPFS Connected to enough gateways --');
                    _this.ipfsConnected = true;
                }
            })["catch"](function (err) {
                clearTimeout(timeout);
                if (verbose)
                    console.log('Failed to fetch gateway or Path based Gateway', gatewayPath);
            });
        });
    }
    return IPFSFetcher;
}());
// Try to fetch a content to via gateway path
var PathResolver = /** @class */ (function () {
    function PathResolver(digested, gateway) {
        this.controller = new AbortController();
        this.signal = this.controller.signal;
        this.gatewayPath = gateway ? gateway.path.replace(':hash', digested) : digested;
    }
    PathResolver.prototype.fetch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        // Fetch digested path from best gateways
                        fetch(_this.gatewayPath, { method: 'HEAD', signal: _this.signal })
                            .then(function (r) {
                            // If fetched return as soon as possible
                            if (r.ok) {
                                resolve(_this.gatewayPath);
                                return;
                            }
                            throw new Error('Error fetching content');
                        })["catch"](function (err) {
                            if (err.name === 'AbortError') {
                                // console.log('Aborted request', this.gatewayPath)
                            }
                            else if (_this.gateway && err.code && err.code != 20) {
                                _this.gateway.errors++;
                            }
                            reject();
                        });
                    })];
            });
        });
    };
    // Kill resolver in case of other fetched faster or timeout
    PathResolver.prototype.kill = function () {
        this.controller.abort();
    };
    return PathResolver;
}());
var PersistentFetcher = /** @class */ (function () {
    function PersistentFetcher(digested, originalPath, notFoundMaxRetriesOverride) {
        if (notFoundMaxRetriesOverride === void 0) { notFoundMaxRetriesOverride = 5; }
        this.digested = digested;
        this.originalPath = originalPath;
        this.resolvers = [];
        this.notFoundMaxRetries = notFoundMaxRetriesOverride;
    }
    // Try persistently to fetch 
    PersistentFetcher.prototype.fetch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.tries = 0;
                        this.found = undefined;
                        _loop_1 = function () {
                            var timeout;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        if (verbose)
                                            console.log('Trying to fetch content, on try', this_1.tries);
                                        // Racing the promises for tries
                                        return [4 /*yield*/, Promise.any(
                                            // Grab the first 3 best gateways not errored
                                            instance.gatewaysFetched
                                                .filter(function (g) { return g.errors < 8; })
                                                .slice(0, 3).map(function (gateway) {
                                                // Try grab the content from one of the gateways
                                                var resolver = new PathResolver(_this.digested, gateway);
                                                _this.resolvers.push(resolver);
                                                return resolver.fetch();
                                            })
                                                .concat(new Promise(function (resolve) {
                                                // Concat a timeout promise in case any of the previous resolves correctly
                                                timeout = setTimeout(function () {
                                                    resolve(null);
                                                }, 1000);
                                            }))).then(function (res) {
                                                // Start clearing the timeout
                                                _this.resolvers.forEach(function (r) { return r.kill(); });
                                                _this.resolvers = [];
                                                clearTimeout(timeout);
                                                // In case of a successful returned result, set found variable
                                                if (res)
                                                    _this.found = res;
                                            })["catch"](function () {
                                                clearTimeout(timeout);
                                            })];
                                    case 1:
                                        // Racing the promises for tries
                                        _b.sent();
                                        if (!this_1.found) {
                                            // In case of nothing found. Try again and increase the counter
                                            this_1.tries++;
                                            clearTimeout(timeout);
                                            this_1.resolvers.forEach(function (r) { return r.kill(); });
                                            this_1.resolvers = [];
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!(!this.found && this.tries < this.notFoundMaxRetries)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 3:
                        // In case of successful found a resource, return it.
                        if (this.found)
                            return [2 /*return*/, this.found
                                // In case of a non successful fetch after notFoundMaxRetries tries, return descriptive error
                            ];
                        // In case of a non successful fetch after notFoundMaxRetries tries, return descriptive error
                        throw new Error('Failed to fetch content. Possibly not pinned in which case the retrieval process should have been initiated.');
                }
            });
        });
    };
    return PersistentFetcher;
}());
// Fetch fastest IPFS gateway url for the desired content 
var FetchContent = function (path, notFoundMaxRetries) {
    if (notFoundMaxRetries === void 0) { notFoundMaxRetries = 3; }
    return __awaiter(void 0, void 0, void 0, function () {
        var digested, fetcher;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    digested = Utilities.digestPath(path);
                    if (!digested.isIPFS) {
                        throw new Error('Invalid IPFS path');
                    }
                    // Wait connection to be completed before try to fetch 
                    return [4 /*yield*/, new Promise(function (resolve) { waitLoop(resolve); })];
                case 1:
                    // Wait connection to be completed before try to fetch 
                    _a.sent();
                    fetcher = new PersistentFetcher(digested.cid + digested.subpath, path, notFoundMaxRetries);
                    return [2 /*return*/, fetcher.fetch()];
            }
        });
    });
};
exports.FetchContent = FetchContent;
// Fetch a JSON formatted doc from fastest IPFS gateways connected
var FetchJSON = function (path, notFoundMaxRetries) {
    if (notFoundMaxRetries === void 0) { notFoundMaxRetries = 3; }
    return __awaiter(void 0, void 0, void 0, function () {
        var newPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, exports.FetchContent)(path, notFoundMaxRetries)];
                case 1:
                    newPath = _a.sent();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            fetch(newPath)
                                .then(function (r) { return r.json(); })
                                .then(function (doc) { return resolve(doc); })["catch"](function (err) {
                                if (err instanceof Error && err.message.toLowerCase().includes('unexpected')) {
                                    reject('Failed to parse JSON. The content fetched is not a valid JSON document.');
                                }
                                else {
                                    reject('Failed to fetch JSON content.');
                                }
                            });
                        })];
            }
        });
    });
};
exports.FetchJSON = FetchJSON;
