export interface ScanResult {
  type: 'node_modules' | 'cache' | 'browser' | 'build' | 'ide' | 'openclaw';
  path: string;
  size: number;
  lastModified: Date;
  description: string;
}

export interface CleanResult {
  path: string;
  size: number;
  success: boolean;
  error?: string;
}

export interface ScannerOptions {
  searchPaths?: string[];
  excludePaths?: string[];
  maxDepth?: number;
  minSize?: number;
  olderThanDays?: number;
}

export interface CleanOptions {
  dryRun?: boolean;
  force?: boolean;
  selected?: string[];
}

export interface Summary {
  totalFound: number;
  totalSize: number;
  items: ScanResult[];
}
