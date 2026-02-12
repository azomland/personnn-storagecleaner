import path from 'path';
import { ScanResult, ScannerOptions } from '../types.js';
import { getDirectorySize, getLastModified, directoryExists, getHomeDirectory } from '../utils/file-utils.js';
import { getDaysAgo } from '../utils/format.js';

export class BrowserScanner {
  private options: ScannerOptions;

  constructor(options: ScannerOptions = {}) {
    this.options = options;
  }

  async scan(): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const home = getHomeDirectory();

    const browserCaches = [
      // Chrome
      {
        path: path.join(home, 'Library/Caches/Google/Chrome'),
        description: 'Google Chrome cache',
        type: 'browser' as const
      },
      {
        path: path.join(home, 'Library/Application Support/Google/Chrome/Default/Cache'),
        description: 'Chrome Default Profile cache',
        type: 'browser' as const
      },
      // Safari
      {
        path: path.join(home, 'Library/Caches/com.apple.Safari'),
        description: 'Safari cache',
        type: 'browser' as const
      },
      // Firefox
      {
        path: path.join(home, 'Library/Caches/Firefox'),
        description: 'Firefox cache',
        type: 'browser' as const
      },
      // Brave
      {
        path: path.join(home, 'Library/Caches/BraveSoftware/Brave-Browser'),
        description: 'Brave Browser cache',
        type: 'browser' as const
      },
      // Edge
      {
        path: path.join(home, 'Library/Caches/Microsoft Edge'),
        description: 'Microsoft Edge cache',
        type: 'browser' as const
      },
      // Arc
      {
        path: path.join(home, 'Library/Caches/company.thebrowser.Browser'),
        description: 'Arc Browser cache',
        type: 'browser' as const
      }
    ];

    for (const cache of browserCaches) {
      try {
        const exists = await directoryExists(cache.path);

        if (!exists) {
          continue;
        }

        const size = await getDirectorySize(cache.path);
        const lastModified = await getLastModified(cache.path);
        const daysAgo = getDaysAgo(lastModified);

        if (this.options.minSize && size < this.options.minSize) {
          continue;
        }

        results.push({
          type: cache.type,
          path: cache.path,
          size,
          lastModified,
          description: `${cache.description} - Last modified ${daysAgo} days ago`
        });
      } catch (error) {
        // Ignorar caches que no se pueden leer
        continue;
      }
    }

    return results.sort((a, b) => b.size - a.size);
  }
}
