import path from 'path';
import { ScanResult, ScannerOptions } from '../types.js';
import { getDirectorySize, getLastModified, directoryExists, getHomeDirectory } from '../utils/file-utils.js';
import { getDaysAgo } from '../utils/format.js';

export class IdeScanner {
  private options: ScannerOptions;

  constructor(options: ScannerOptions = {}) {
    this.options = options;
  }

  async scan(): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const home = getHomeDirectory();

    const ideLocations = [
      // Modern AI IDEs - Global configs/caches
      {
        path: path.join(home, '.cursor'),
        description: 'Cursor IDE cache/config',
        type: 'ide' as const
      },
      {
        path: path.join(home, '.windsurf'),
        description: 'Windsurf IDE cache/config',
        type: 'ide' as const
      },
      {
        path: path.join(home, '.kiro'),
        description: 'Kiro IDE cache/config',
        type: 'ide' as const
      },
      {
        path: path.join(home, '.n8n'),
        description: 'n8n workflow automation data',
        type: 'ide' as const
      },
      // macOS Application Support locations
      {
        path: path.join(home, 'Library/Application Support/Cursor'),
        description: 'Cursor IDE Application Support',
        type: 'ide' as const
      },
      {
        path: path.join(home, 'Library/Application Support/Windsurf'),
        description: 'Windsurf IDE Application Support',
        type: 'ide' as const
      },
      // macOS Caches locations
      {
        path: path.join(home, 'Library/Caches/Cursor'),
        description: 'Cursor IDE cache',
        type: 'ide' as const
      },
      {
        path: path.join(home, 'Library/Caches/Windsurf'),
        description: 'Windsurf IDE cache',
        type: 'ide' as const
      },
      // Apple Media Analysis - El famoso que ocupa toneladas de gigas jajaja
      {
        path: path.join(home, 'Library/Containers/com.apple.mediaanalysisd'),
        description: 'Apple Media Analysis (face/object recognition cache) - SAFE TO DELETE',
        type: 'ide' as const
      },
      {
        path: path.join(home, 'Library/Containers/com.apple.mediaanalysisd/Data'),
        description: 'Apple Media Analysis Data',
        type: 'ide' as const
      }
    ];

    for (const location of ideLocations) {
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
        // Ignorar directorios que no se pueden leer
        continue;
      }
    }

    return results.sort((a, b) => b.size - a.size);
  }
}
