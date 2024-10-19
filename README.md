# Fastify-Bowser
![Build & Test](https://github.com/bsnext/fastify-bowser/actions/workflows/build_n_test.yml/badge.svg)
![Node.JS Supported](https://badgen.net/static/Node.JS/%3E=19.0.0/green)
![Fastify Supported](https://badgen.net/static/Fastify/%3E=4.14.0/green)
![Install Size](https://badgen.net/packagephobia/install/@bsnext/fastify-bowser)
![Dependencies](https://badgen.net/bundlephobia/dependency-count/@bsnext/fastify-bowser)
![License](https://badgen.net/static/license/MIT/blue)

The plugin adds the "request.useragent" property, which returns the parsed data.

**Tested on Fastify v4.14+ and Node.JS v19+!**<br>
https://github.com/bsnext/fastify-bowser/actions/workflows/build_n_test.yml

Why "[bowser](https://www.npmjs.com/package/bowser)", not "[ua-parser-js](https://www.npmjs.com/package/ua-parser-js)" or other library?
Bowser it's a zero-dependency package with MIT license, unlike "ua-parser-js" under AGPL-3.0. Both of these libraries are good, but on top of that, bowser [is about x4 times more faster](https://github.com/bsnext/fastify-bowser/blob/master/info/benchmark.md).

Why not [those package](https://github.com/Eomm/fastify-user-agent)? Under hood it have a "[useragent](https://www.npmjs.com/package/useragent)" - library with 2 dependencies. One of that is "LRU-Cache". But without cache it [have a performance less than both previously](https://github.com/bsnext/fastify-bowser/blob/master/info/benchmark.md) mentioned libraries. Also, **this library excludes parsing of user-agent until you call this property in request**.

## Installing:
```bash
npm install @bsnext/fastify-bowser
```

## Usage:
```ts
import FastifyBowser from '@bsnext/fastify-bowser'; // TS
import { default as FastifyBowser } from "@bsnext/fastify-bowser"; // MJS
const { default: FastifyBowser } = require(`@bsnext/fastify-bowser`); // CJS

const server = Fastify();
await server.register(FastifyBowser, {
	// Use parsed user-agent LRU cache
	cache: boolean = false; 

 	// Cache LRU max size.
	cacheLimit?: number = 100;

	// Automatically cache purge interval in seconds.
	// Disabled by default
	cachePurgeTime?: number;
});

```

## Example

```ts
import Fastify from 'fastify'; 
import FastifyBowser from '@bsnext/fastify-bowser';

const server = Fastify(...);
await server.register(FastifyBowser, { cache: true });

server.get(`/test`, function(request, response) {
	response.send(request.useragent);

	/* {
		browser: { name: 'Chrome', version: '129.0.0.0' },
		os: { name: 'Windows', version: 'NT 10.0', versionName: '10' },
		platform: { type: 'desktop' },
		engine: { name: 'Blink' }
	} */
})

server.listen({ port: 8080 });

```