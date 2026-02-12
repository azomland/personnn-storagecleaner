import path from 'path';
import { ScanResult, ScannerOptions } from '../types.js';
import { getDirectorySize, getLastModified, directoryExists, getHomeDirectory } from '../utils/file-utils.js';
import { getDaysAgo } from '../utils/format.js';

export class CacheScanner {
  private options: ScannerOptions;

  constructor(options: ScannerOptions = {}) {
    this.options = options;
  }

  async scan(): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const home = getHomeDirectory();

    const cacheLocations = [
      // Package managers
      {
        path: path.join(home, '.npm'),
        description: 'npm cache',
        type: 'cache' as const
      },
      {
        path: path.join(home, '.yarn/cache'),
        description: 'Yarn cache',
        type: 'cache' as const
      },
      {
        path: path.join(home, 'Library/Caches/pnpm'),
        description: 'pnpm cache',
        type: 'cache' as const
      },
      {
        path: path.join(home, 'Library/Caches/Homebrew'),
        description: 'Homebrew cache',
        type: 'cache' as const
      },
      {
        path: path.join(home, 'Library/Caches/pip'),
        description: 'pip cache',
        type: 'cache' as const
      },
      {
        path: path.join(home, '.cache/pip'),
        description: 'pip cache (alternative)',
        type: 'cache' as const
      },
      // Turbo
      {
        path: path.join(home, 'Library/Caches/turborepo'),
        description: 'Turborepo cache',
        type: 'cache' as const
      },
      // Next.js
      {
        path: path.join(home, 'Library/Caches/next.js'),
        description: 'Next.js cache',
        type: 'cache' as const
      }
    ];

    for (const location of cacheLocations) {
      try {
        const exists = await directoryExists(location.path);

        if (!exists) {
          continue;
        }

        const size = await getDirectorySize(location.path);
        const lastModified = await getLastModified(location.path);
        const daysAgo = getDaysAgo(lastModified);

        if (this.options.minSize && size < this.options.minSize) {
          continue;
        }

        results.push({
          type: location.type,
          path: location.path,
          size,
          lastModified,
          description: `${location.description} - Last modified ${daysAgo} days ago`
        });
      } catch (error) {
        // Ignorar caches que no se pueden leer
        continue;
      }
    }

    return results.sort((a, b) => b.size - a.size);
  }
}
