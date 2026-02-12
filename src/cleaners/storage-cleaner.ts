import { CleanResult, ScanResult, CleanOptions } from '../types.js';
import { deleteDirectory } from '../utils/file-utils.js';

export class StorageCleaner {
  async clean(items: ScanResult[], options: CleanOptions = {}): Promise<CleanResult[]> {
    const results: CleanResult[] = [];
    const itemsToClean = options.selected
      ? items.filter(item => options.selected!.includes(item.path))
      : items;

    if (options.dryRun) {
      return itemsToClean.map(item => ({
        path: item.path,
        size: item.size,
        success: true,
        error: 'DRY RUN - not actually deleted'
      }));
    }

    for (const item of itemsToClean) {
      try {
        await deleteDirectory(item.path);
        results.push({
          path: item.path,
          size: item.size,
          success: true
        });
      } catch (error) {
        results.push({
          path: item.path,
          size: item.size,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }

  async cleanPaths(paths: string[]): Promise<CleanResult[]> {
    const results: CleanResult[] = [];

    for (const path of paths) {
      try {
        await deleteDirectory(path);
        results.push({
          path,
          size: 0,
          success: true
        });
      } catch (error) {
        results.push({
          path,
          size: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    return results;
  }
}
