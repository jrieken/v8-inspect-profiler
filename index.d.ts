declare module 'v8-inspect-profiler' {

    export interface Profile { }

    export interface ProfilingSession {
        stop(afterDelay?: number): PromiseLike<Profile>;
    }

    export interface Target {
        description: string,
        devtoolsFrontendUrl: string,
        id: string,
        title: string,
        type: string,
        url: string,
        webSocketDebuggerUrl: string
    }

    export function listTabs(options: { port: number, tries?: number, retyWait?: number }): PromiseLike<Target[]>;
    export function startProfiling(options: { port: number, tries?: number, retyWait?: number, chooseTab?: (targets: Target[]) => Target }): PromiseLike<ProfilingSession>;
    export function writeProfile(profile: Profile, name?: string): PromiseLike<void>;
    export function rewriteAbsolutePaths(profile, replaceWith?);
}
