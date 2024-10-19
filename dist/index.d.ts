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
declare const _default: (fastify: import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>, initOptions: PluginOptions, done: (err?: Error) => void) => void;
export default _default;
