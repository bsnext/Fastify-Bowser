import type { FastifyRequest } from "fastify";
import FastifyPlugin from "fastify-plugin";

import * as Bowser from "bowser";

////////////////////////////////

declare module "fastify" {
	interface FastifyRequest {
		useragent: {
			browser: {
				name?: string;
				version?: string;
			};
			os: {
				name?: string;
				version?: string;
				versionName?: string;
			};
			platform: {
				type?: string;
				vendor?: string;
				model?: string;
			};
			engine: {
				name?: string;
				version?: string;
			};
		};
	}
}

export interface PluginOptions {
	cache?: boolean;
	cacheLimit?: number;
	cachePurgeTime?: number;
}

////////////////////////////////

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

////////////////////////////////

export default FastifyPlugin(
	function (fastify, initOptions: PluginOptions, done) {
		if (initOptions.cache === true) {
			if (initOptions.cacheLimit && ((typeof initOptions.cacheLimit !== `number`) || (initOptions.cacheLimit < 1))) {
				console.warn(`Invalid parameter "cacheLimit" for @bsnext/fastify-bowser`);
			}
			if (initOptions.cachePurgeTime && ((typeof initOptions.cachePurgeTime !== `number`) || (initOptions.cachePurgeTime < 1))) {
				console.warn(`Invalid parameter "cachePurgeTime" for @bsnext/fastify-bowser`);
			}
		}

		////////////////////////////////

		const isCaching = initOptions.cache;

		if (isCaching) {
			const cachePool = new LRUCache(initOptions.cacheLimit || 100);

			if (initOptions.cachePurgeTime) {
				setInterval(cachePool.clear.bind(cachePool), initOptions.cachePurgeTime * 1000);
			}
			
			fastify.decorateRequest(`useragent`, {
				getter() {
					const userAgent = (this as FastifyRequest).headers[`user-agent`];

					if ((userAgent === undefined) || (userAgent === ``)) {
						return undefinedUserAgentInfo;
					}

					const cachedQuery = cachePool.get<FastifyRequest[`useragent`]>(userAgent);

					if (cachedQuery !== undefined) {
						return cachedQuery;
					}

					const uaParseResult = Bowser.parse(userAgent);

					cachePool.set(userAgent, uaParseResult)

					return uaParseResult;
				}
			});

		} else {
			fastify.decorateRequest(`useragent`, {
				getter() {
					const userAgent = (this as FastifyRequest).headers[`user-agent`];
	
					if ((userAgent === undefined) || (userAgent === ``)) {
						return undefinedUserAgentInfo;
					}
	
					const uaParseResult = Bowser.parse(userAgent);	
	
					return uaParseResult;
				}
			});

		}

		done();
	},
	{
		fastify: `^4.x.x || ^5.x`,
		name: `@bsnext/fastify-bowser`
	}
);

////////////////////////////////

interface LRUCacheNode {
    key: string;
    value: any;
    prev: LRUCacheNode | null;
    next: LRUCacheNode | null;
}

class LRUCache {
    private limit: number;
    private cache: Record<string, LRUCacheNode | undefined>;
    private size: number = 0;
    private head: LRUCacheNode | null = null;
    private tail: LRUCacheNode | null = null;

    constructor(limit: number = 100) {
        this.limit = limit;
        this.cache = {};
    }

    private moveToHead(node: LRUCacheNode): void {
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

    private removeTail(): void {
        if (this.tail === null) {
            return;
        }

        const tailNode = this.tail;
        delete this.cache[tailNode.key];

        if (tailNode.prev !== null) {
            this.tail = tailNode.prev;
            this.tail.next = null;
        } else {
            this.head = null;
            this.tail = null;
        }

        this.size--;
    }

    get<T>(key: string): T | undefined {
        const node = this.cache[key];

        if (node === undefined) {
            return undefined;
        }

        this.moveToHead(node);

        return node.value as T;
    }

    set(key: string, value: any): void {
        let node = this.cache[key];

        if (node !== undefined) {
            node.value = value;
            this.moveToHead(node);
        } else {
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

    clear(): void {
        this.cache = {};
        this.head = null;
        this.tail = null;
        this.size = 0;
    }
}