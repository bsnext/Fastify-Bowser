#### If you wanna try that, disable "LRU" in "useragent" for fair benchmark:
```js
// node_modules/useragent/index.js : line 510

exports.lookup = function lookup(userAgent, jsAgent) {
  var key = (userAgent || '')+(jsAgent || '');
  return exports.parse(userAgent, jsAgent);
};
```

#### Modules:
```
npm install ua-parser-js bowser useragent
```

#### Code:

```ts
import { UAParser } from "ua-parser-js";
import * as Bowser from "bowser";
import * as Useragent from "useragent";

import * as Benchmark from "benchmark";

const bench = new Benchmark.Suite();

/////////////////////////////

const uaParserInstance = new UAParser();

/////////////////////////////

bench.add(`bowser`, function () {
    const result = Bowser.parse(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`);
});

bench.add(`ua-parser-js`, function () {
    const result = uaParserInstance.setUA(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`).getResult();
});

bench.add(`useragent`, function () {
    const result = Useragent.lookup(`Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36`);
});

/////////////////////////////

bench.on('cycle', function (e) {
    console.log(e.target.toString());
});

bench.run();
```

#### Results:
```js
bowser x 188,346 ops/sec ±0.48% (93 runs sampled)
ua-parser-js x 50,341 ops/sec ±0.70% (94 runs sampled)
useragent x 34,391 ops/sec ±0.37% (93 runs sampled)

// Node v22.8.0, Win 11, Ryzen 7 3800X 3.89 GHz, 32 GB RAM 3200 MHz
```