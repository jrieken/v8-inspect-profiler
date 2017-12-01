### V8 Inspect Profiler

This node module offers v8 cpu profiling via the [Chrome DevTools protocol](https://chromedevtools.github.io/devtools-protocol/v8/Profiler/). 


### Usage


Start the node.js instance that you want to profile

```
node --inspect-brk=5222 myApp.js
```

Next, start profiling. Create an app that starts and stops profiling. Like so: 

```js
const profiler = require('v8-inspect-profiler');

// start profiler
const session = await profiler.startProfiling({port: 5222 });

// time goes by ...

const profile = await session.stop();

await profiler.writeProfile(profile, 'somepath.cpuprofile');
```
