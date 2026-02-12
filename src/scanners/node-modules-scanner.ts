import fg from 'fast-glob';
import path from 'path';
import { ScanResult, ScannerOptions } from '../types.js';
import { getDirectorySize, getLastModified, expandPath } from '../utils/file-utils.js';
import { getDaysAgo } from '../utils/format.js';

export class NodeModulesScanner {
  private options: ScannerOptions;

  constructor(options: ScannerOptions = {}) {
    this.options = {
      searchPaths: options.searchPaths || ['~'],
      excludePaths: options.excludePaths || [
        '**/Library/**',
        '**/System/**',
        '**/.Trash/**'
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
      // Buscar todas las carpetas node_modules
      const pattern = `${searchPath}/**/node_modules`;
      const ignore = this.options.excludePaths || [];

      try {
        const nodeModulesDirs = await fg(pattern, {
          onlyDirectories: true,
          deep: this.options.maxDepth,
          ignore,
          absolute: true,
          suppressErrors: true
        });

        for (const dir of nodeModulesDirs) {
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

            // Obtener el nombre del proyecto
            const projectName = path.basename(path.dirname(dir));

            results.push({
              type: 'node_modules',
              path: dir,
              size,
              lastModified,
              description: `${projectName} - Last modified ${daysAgo} days ago`
            });
          } catch (error) {
            // Ignorar directorios que no se pueden leer
            continue;
          }
        }
      } catch (error) {
        console.error(`Error scanning ${searchPath}:`, error);
      }
    }

    // Ordenar por tamaño descendente
    return results.sort((a, b) => b.size - a.size);
  }
}
