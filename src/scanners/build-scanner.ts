import fg from 'fast-glob';
import path from 'path';
import { ScanResult, ScannerOptions } from '../types.js';
import { getDirectorySize, getLastModified, expandPath } from '../utils/file-utils.js';
import { getDaysAgo } from '../utils/format.js';

export class BuildScanner {
  private options: ScannerOptions;
  private buildDirs = ['dist', 'build', '.next', 'out', '.turbo', '.cache', 'coverage'];

  constructor(options: ScannerOptions = {}) {
    this.options = {
      searchPaths: options.searchPaths || ['~'],
      excludePaths: options.excludePaths || [
        '**/Library/**',
        '**/System/**',
        '**/.Trash/**',
        '**/node_modules/**'
      ],
      maxDepth: options.maxDepth || 5,
      olderThanDays: options.olderThanDays || 0,
      minSize: options.minSize || 0
    };
  }

  async scan(): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const searchPaths = this.options.searchPaths!.map(p => expandPath(p));

    for (const searchPath of searchPaths) {
      for (const buildDir of this.buildDirs) {
        const pattern = `${searchPath}/**/${buildDir}`;
        const ignore = this.options.excludePaths || [];

        try {
          const dirs = await fg(pattern, {
            onlyDirectories: true,
            deep: this.options.maxDepth,
            ignore,
            absolute: true,
            suppressErrors: true
          });

          for (const dir of dirs) {
            try {
              const size = await getDirectorySize(dir);
              const lastModified = await getLastModified(dir);
              const daysAgo = getDaysAgo(lastModified);

              // Filtros
              if (this.options.minSize && size < this.options.minSize) {
                continue;
              }

              if (this.options.olderThanDays && daysAgo < this.options.olderThanDays) {
                continue;
              }

              const projectName = path.basename(path.dirname(dir));
              const buildType = path.basename(dir);

              results.push({
                type: 'build',
                path: dir,
                size,
                lastModified,
                description: `${projectName}/${buildType} - Last modified ${daysAgo} days ago`
              });
            } catch (error) {
              continue;
            }
          }
        } catch (error) {
          console.error(`Error scanning for ${buildDir}:`, error);
        }
      }
    }

    return results.sort((a, b) => b.size - a.size);
  }
}
