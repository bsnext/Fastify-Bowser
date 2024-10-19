"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = require("fastify-plugin");
const Bowser = require("bowser");
const undefinedUserAgentInfo = {
    browser: { name: `''`, version: `''` },
    os: {},
    platform: {},
    engine: {}
};
Object.freeze(undefinedUserAgentInfo.browser);
Object.freeze(undefinedUserAgentInfo.os);
Object.freeze(undefinedUserAgentInfo.platform);
Object.freeze(undefinedUserAgentInfo.engine);
Object.freeze(undefinedUserAgentInfo);
exports.default = (0, fastify_plugin_1.default)(function (fastify, initOptions, done) {
    if (initOptions.cache === true) {
        if (initOptions.cacheLimit && ((typeof initOptions.cacheLimit !== `number`) || (initOptions.cacheLimit < 1))) {
            console.warn(`Invalid parameter "cacheLimit" for @bsnext/fastify-bowser`);
        }
        if (initOptions.cachePurgeTime && ((typeof initOptions.cachePurgeTime !== `number`) || (initOptions.cachePurgeTime < 1))) {
            console.warn(`Invalid parameter "cachePurgeTime" for @bsnext/fastify-bowser`);
        }
    }
    const isCaching = initOptions.cache;
    let cacheLimit = initOptions.cacheLimit || 100;
    let cacheSize = 0;
    let cachePool = Object.create(null);
    function purgeCache() {
        cachePool = Object.create(null);
        cacheSize = 0;
    }
    if (isCaching) {
        setInterval(purgeCache, (initOptions.cachePurgeTime || (60 * 5)) * 1000);
    }
    fastify.decorateRequest(`useragent`, {
        getter() {
            const userAgent = this.headers[`user-agent`];
            if ((userAgent === undefined) || (userAgent === ``)) {
                return undefinedUserAgentInfo;
            }
            const cachedQuery = cachePool[userAgent];
            if (isCaching && cachedQuery) {
                return cachedQuery;
            }
            const uaParseResult = Bowser.parse(userAgent);
            if (isCaching) {
                if (cacheSize >= cacheLimit) {
                    purgeCache();
                }
                cacheSize = cacheSize + 1;
                cachePool[userAgent] = uaParseResult;
            }
            ;
            return uaParseResult;
        }
    });
    done();
}, {
    fastify: `^4.x.x || ^5.x`,
    name: `@bsnext/fastify-bowser`
});
//# sourceMappingURL=index.js.map