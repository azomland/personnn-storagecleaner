import { NodeModulesScanner } from './node-modules-scanner.js';
import { CacheScanner } from './cache-scanner.js';
import { BrowserScanner } from './browser-scanner.js';
import { BuildScanner } from './build-scanner.js';
import { IdeScanner } from './ide-scanner.js';
import { OpenClawScanner } from './openclaw-scanner.js';

import { ScanResult, ScannerOptions, Summary } from '../types.js';

export class StorageScanner {
  private options: ScannerOptions;

  constructor(options: ScannerOptions = {}) {
    this.options = options;
  }

  async scanAll(): Promise<Summary> {
    const scanners = [
      new NodeModulesScanner(this.options),
      new CacheScanner(this.options),
      new BrowserScanner(this.options),
      new BuildScanner(this.options),
      new IdeScanner(this.options),
      new OpenClawScanner(this.options)
    ];

    const allResults: ScanResult[] = [];

    for (const scanner of scanners) {
      const results = await scanner.scan();
      allResults.push(...results);
    }

    const totalSize = allResults.reduce((sum, item) => sum + item.size, 0);

    return {
      totalFound: allResults.length,
      totalSize,
      items: allResults.sort((a, b) => b.size - a.size)
    };
  }

  async scanNodeModules(): Promise<Summary> {
    const scanner = new NodeModulesScanner(this.options);
    const items = await scanner.scan();
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    return {
      totalFound: items.length,
      totalSize,
      items
    };
  }

  async scanCaches(): Promise<Summary> {
    const scanner = new CacheScanner(this.options);
    const items = await scanner.scan();
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    return {
      totalFound: items.length,
      totalSize,
      items
    };
  }

  async scanBrowsers(): Promise<Summary> {
    const scanner = new BrowserScanner(this.options);
    const items = await scanner.scan();
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    return {
      totalFound: items.length,
      totalSize,
      items
    };
  }

  async scanBuilds(): Promise<Summary> {
    const scanner = new BuildScanner(this.options);
    const items = await scanner.scan();
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    return {
      totalFound: items.length,
      totalSize,
      items
    };
  }

  async scanIdes(): Promise<Summary> {
    const scanner = new IdeScanner(this.options);
    const items = await scanner.scan();
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    return {
      totalFound: items.length,
      totalSize,
      items
    };
  }

  async scanOpenClaw(): Promise<Summary> {
    const scanner = new OpenClawScanner(this.options);
    const items = await scanner.scan();
    const totalSize = items.reduce((sum, item) => sum + item.size, 0);

    return {
      totalFound: items.length,
      totalSize,
      items
    };
  }
}

export * from './node-modules-scanner.js';
export * from './cache-scanner.js';
export * from './browser-scanner.js';
export * from './build-scanner.js';
export * from './ide-scanner.js';
export * from './openclaw-scanner.js';

