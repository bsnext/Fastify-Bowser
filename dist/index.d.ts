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
declare const _default: (fastify: import("fastify").FastifyInstance<import("fastify").RawServerDefault, import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, import("fastify").FastifyBaseLogger, import("fastify").FastifyTypeProviderDefault>, initOptions: PluginOptions, done: (err?: Error) => void) => void;
export default _default;
