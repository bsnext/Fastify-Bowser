import { test } from 'uvu';
import * as assert from 'uvu/assert';

////////////////////////////////

import Fastify, { FastifyInstance } from 'fastify';
import BowserPlugin, { PluginOptions } from '../index';

////////////////////////////////

async function prepareServer(): Promise<FastifyInstance> {
	const server = Fastify({
		logger: false,
		ignoreTrailingSlash: true,
	});

	await server.register(BowserPlugin);

	server.get(`/test`, function (request, response) {
		response.send({
			test: true,
			useragent: request.useragent
		});
	});

	return new Promise(function (resolve, reject) {
		server.listen({ port: 8080 },
			async function () {
				resolve(server);
			}
		);
	});
}

////////////////////////////////

test('Test', async () => {
	const server = await prepareServer();

	try {
		const result_test = await fetch(`http://127.0.0.1:8080/test`, {
			method: `GET`,
			headers: {
				[`User-Agent`]: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`
			}
		}).then(async o => await o.json());

		assert.equal(result_test, {
			test: true,
			useragent: {
				browser: { name: 'Chrome', version: '129.0.0.0' },
				os: { name: 'Windows', version: 'NT 10.0', versionName: '10' },
				platform: { type: 'desktop' },
				engine: { name: 'Blink' }
			}
		});
	} catch (e) {
		throw e;
	} finally {
		server.close();
	}
});

////////////////////////////////

test.run();