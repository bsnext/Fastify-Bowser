"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = require("fastify-plugin");
const Bowser = require("bowser");
const undefinedUserAgentInfo = {
    browser: { name: ``, version: `` },
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
    if (isCaching) {
        const cachePool = new LRUCache(initOptions.cacheLimit || 100);
        if (initOptions.cachePurgeTime) {
            setInterval(cachePool.clear.bind(cachePool), initOptions.cachePurgeTime * 1000);
        }
        fastify.decorateRequest(`useragent`, {
            getter() {
                const userAgent = this.headers[`user-agent`];
                if ((userAgent === undefined) || (userAgent === ``)) {
                    return undefinedUserAgentInfo;
                }
                const cachedQuery = cachePool.get(userAgent);
                if (cachedQuery !== undefined) {
                    return cachedQuery;
                }
                const uaParseResult = Bowser.parse(userAgent);
                cachePool.set(userAgent, uaParseResult);
                return uaParseResult;
            }
        });
    }
    else {
        fastify.decorateRequest(`useragent`, {
            getter() {
                const userAgent = this.headers[`user-agent`];
                if ((userAgent === undefined) || (userAgent === ``)) {
                    return undefinedUserAgentInfo;
                }
                const uaParseResult = Bowser.parse(userAgent);
                return uaParseResult;
            }
        });
    }
    done();
}, {
    fastify: `^4.x.x || ^5.x`,
    name: `@bsnext/fastify-bowser`
});
class LRUCache {
    constructor(limit = 100) {
        this.size = 0;
        this.head = null;
        this.tail = null;
        this.limit = limit;
        this.cache = {};
    }
    moveToHead(node) {
        if (this.head === node) {
            return;
        }
        if (node.prev !== null) {
            node.prev.next = node.next;
        }
        if (node.next !== null) {
            node.next.prev = node.prev;
        }
        if (this.tail === node) {
            this.tail = node.prev;
        }
        node.next = this.head;
        node.prev = null;
        if (this.head !== null) {
            this.head.prev = node;
        }
        this.head = node;
        if (this.tail === null) {
            this.tail = node;
        }
    }
    removeTail() {
        if (this.tail === null) {
            return;
        }
        const tailNode = this.tail;
        delete this.cache[tailNode.key];
        if (tailNode.prev !== null) {
            this.tail = tailNode.prev;
            this.tail.next = null;
        }
        else {
            this.head = null;
            this.tail = null;
        }
        this.size--;
    }
    get(key) {
        const node = this.cache[key];
        if (node === undefined) {
            return undefined;
        }
        this.moveToHead(node);
        return node.value;
    }
    set(key, value) {
        let node = this.cache[key];
        if (node !== undefined) {
            node.value = value;
            this.moveToHead(node);
        }
        else {
            node = {
                key: key,
                value: value,
                prev: null,
                next: null,
            };
            this.cache[key] = node;
            this.moveToHead(node);
            this.size++;
            if (this.size > this.limit) {
                this.removeTail();
            }
        }
    }
    clear() {
        this.cache = {};
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
}
//# sourceMappingURL=index.js.map