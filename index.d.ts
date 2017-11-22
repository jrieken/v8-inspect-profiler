declare module 'v8-inspect-profiler' {

    export type Profile = any;

    export interface ProfilingSession {
        async stop(): Profile;
    }

    export async function startProfiling(port: number): ProfilingSession;
    export async function writeProfile(profile: Profile, dir?: string, name?: string): void;
    export async function rewriteAbsolutePaths(profile, replaceWith?);
}
