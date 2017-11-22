/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

const { promisify } = require('util');
const { join, isAbsolute, basename } = require('path');
const { writeFile } = require('fs');
const cdp = require('chrome-remote-interface');


async function wait(n) {
    return new Promise(resolve => setTimeout(resolve, n));
}

async function connectWithRetry(port, retry = 500, retryWait = 50) {
    function chooseTab(targets) {
        const target = targets.find(target => {
            if (target.webSocketDebuggerUrl) {
                if (target.type === 'page') {
                    return target.url.indexOf('bootstrap/index.html') > 0
                } else {
                    return true;
                }
            }
        });
        if (!target) {
            throw new class extends Error {
                constructor() {
                    super('no target');
                    this.code = 'ECONNREFUSED';
                }
            };
        }
        return target;
    }

    try {
        const client = await cdp({
            port,
            chooseTab,
            local: true,
        });
        console.log(`CONNECTED with ${retry} retries left...`)
        return client;
    } catch (e) {
        if (e.code !== 'ECONNREFUSED' || retry === 0) {
            throw e;
        }
        await wait(retryWait);
        return connectWithRetry(port, retry - 1);
    }
}

async function startProfiling(port) {

    const client = await connectWithRetry(port);
    const { Runtime, Profiler } = client;

    await Runtime.runIfWaitingForDebugger();

    await Profiler.enable();
    await Profiler.setSamplingInterval({ interval: 100 });
    await Profiler.start();

    return {
        stop: async function () {
            const data = await Profiler.stop();
            await client.close();
            return data;
        }
    }
}

function rewriteAbsolutePaths(profile, replace = 'noAbsolutePaths') {
    for (const node of profile.profile.nodes) {
        if (node.callFrame && node.callFrame.url) {
            if (isAbsolute(node.callFrame.url)) {
                node.callFrame.url = join(replace, basename(node.callFrame.url));
            }
        }
    }
    return profile;
}

async function writeProfile(profileData, dir = __dirname, name = `profile-${Date.now()}.cpuprofile`) {
    const filename = join(dir, name);
    const data = JSON.stringify(profileData.profile, null, 4);
    await promisify(writeFile)(filename, data);
}

module.exports = {
    startProfiling,
    writeProfile,
    rewriteAbsolutePaths
}


async function profileNSeconds(port, n = 4000) {
    const session = await startProfiling(port)
    await wait(n);
    const data = await session.stop();
    await writeProfile(data);
}

Promise.all([
    profileNSeconds(9227),
    profileNSeconds(9228),
    profileNSeconds(9229)
])
