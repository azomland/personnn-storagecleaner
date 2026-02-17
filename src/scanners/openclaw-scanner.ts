import path from 'path';
import { ScanResult, ScannerOptions } from '../types.js';
import { getDirectorySize, getLastModified, deleteDirectory, getHomeDirectory } from '../utils/file-utils.js';
import { getDaysAgo } from '../utils/format.js';
import fs from 'fs/promises';

export async function pathExists(p: string): Promise<boolean> {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}

export class OpenClawScanner {
    private options: ScannerOptions;

    constructor(options: ScannerOptions = {}) {
        this.options = options;
    }

    async scan(): Promise<ScanResult[]> {
        const results: ScanResult[] = [];
        const home = getHomeDirectory();

        const locations = [
            {
                path: path.join(home, '.openclaw'),
                description: 'OpenClaw data directory',
                type: 'openclaw' as const
            },
            {
                path: path.join(home, '.config/openclaw'),
                description: 'OpenClaw configuration',
                type: 'openclaw' as const
            },
            {
                path: path.join(home, '.local/share/openclaw'),
                description: 'OpenClaw local data',
                type: 'openclaw' as const
            },
            {
                path: path.join(home, 'Library/LaunchAgents/ai.openclaw.gateway.plist'),
                description: 'OpenClaw LaunchAgent (Startup file)',
                type: 'openclaw' as const
            }
        ];

        for (const location of locations) {
            try {
                const exists = await pathExists(location.path);

                if (!exists) {
                    continue;
                }

                const size = await getDirectorySize(location.path);
                const lastModified = await getLastModified(location.path);

                results.push({
                    type: location.type,
                    path: location.path,
                    size,
                    lastModified,
                    description: `${location.description} - Found traces of OpenClaw`
                });
            } catch (error) {
                continue;
            }
        }

        // Check for running processes
        try {
            const { execAsync } = await import('../utils/file-utils.js');
            const { stdout } = await execAsync('pgrep -f "openclaw"');
            if (stdout.trim()) {
                const pids = stdout.trim().split('\n');
                results.push({
                    type: 'openclaw' as const,
                    path: 'PROCESS:openclaw',
                    size: 0,
                    lastModified: new Date(),
                    description: `OpenClaw process running (PIDs: ${pids.join(', ')})`
                });
            }
        } catch (error) {
            // pgrep returns error if no process found, ignore
        }

        return results.sort((a, b) => b.size - a.size);
    }
}
