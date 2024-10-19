"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const uvu_1 = require("uvu");
const assert = require("uvu/assert");
const fastify_1 = require("fastify");
const index_1 = require("../index");
function prepareServer(cache) {
    return __awaiter(this, void 0, void 0, function* () {
        const server = (0, fastify_1.default)({
            logger: false,
            ignoreTrailingSlash: true,
        });
        yield server.register(index_1.default, { cache: cache, cacheLimit: 200 });
        server.get(`/test`, function (request, response) {
            response.send({
                test: true,
                useragent: request.useragent
            });
        });
        return new Promise(function (resolve, reject) {
            server.listen({ port: 8080 }, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    resolve(server);
                });
            });
        });
    });
}
(0, uvu_1.test)('Test With Enabled Cache', () => __awaiter(void 0, void 0, void 0, function* () {
    const server = yield prepareServer(true);
    try {
        const result_test = yield fetch(`http://127.0.0.1:8080/test`, {
            method: `GET`,
            headers: {
                [`User-Agent`]: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`
            }
        }).then((o) => __awaiter(void 0, void 0, void 0, function* () { return yield o.json(); }));
        assert.equal(result_test, {
            test: true,
            useragent: {
                browser: { name: 'Chrome', version: '129.0.0.0' },
                os: { name: 'Windows', version: 'NT 10.0', versionName: '10' },
                platform: { type: 'desktop' },
                engine: { name: 'Blink' }
            }
        });
    }
    catch (e) {
        throw e;
    }
    finally {
        server.close();
    }
}));
(0, uvu_1.test)('Test With Disabled Cache', () => __awaiter(void 0, void 0, void 0, function* () {
    const server = yield prepareServer(false);
    try {
        const result_test = yield fetch(`http://127.0.0.1:8080/test`, {
            method: `GET`,
            headers: {
                [`User-Agent`]: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`
            }
        }).then((o) => __awaiter(void 0, void 0, void 0, function* () { return yield o.json(); }));
        assert.equal(result_test, {
            test: true,
            useragent: {
                browser: { name: 'Chrome', version: '129.0.0.0' },
                os: { name: 'Windows', version: 'NT 10.0', versionName: '10' },
                platform: { type: 'desktop' },
                engine: { name: 'Blink' }
            }
        });
    }
    catch (e) {
        throw e;
    }
    finally {
        server.close();
    }
}));
uvu_1.test.run();
//# sourceMappingURL=index.js.map