import { FastifyRequest } from "fastify";
import FastifyPlugin from "fastify-plugin";

import * as Bowser from "bowser";

////////////////////////////////

declare module "fastify" {
	interface FastifyRequest {
		useragent: {
			ua: string;
			browser: {
				name: string | undefined;
				version: string | undefined;
			};
			os: {
				name: string | undefined;
				version: string | undefined;
				versionName: string | undefined;
			};
			platform: {
				type: string | undefined;
			};
			engine: {
				name: string | undefined;
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

		////////////////////////////////

		fastify.decorateRequest(`useragent`, {
			getter() {
				const userAgent = (this as FastifyRequest).headers[`user-agent`];

				if ((userAgent === undefined) || (userAgent === ``)) {
					return undefinedUserAgentInfo;
				}

				const cachedQuery = cachePool[userAgent];

				if (isCaching && cachedQuery) {
					return cachedQuery;
				}

				const uaParseResult = Bowser.parse(userAgent);
				
				if (isCaching) {
					if (cacheSize >= cacheLimit!) {
						purgeCache();
					}

					cacheSize = cacheSize + 1;
					cachePool[userAgent] = uaParseResult;
				};


				return uaParseResult;
			}
		});

		done();
	},
	{
		fastify: `^4.x.x || ^5.x`,
		name: `@bsnext/fastify-bowser`
	}
);