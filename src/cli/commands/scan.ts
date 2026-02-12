import chalk from 'chalk';
import ora from 'ora';
import { StorageScanner } from '../../scanners/index.js';
import { formatSize } from '../../utils/format.js';
import { ScannerOptions } from '../../types.js';

interface ScanOptions {
  path: string;
  type: string;
  days: string;
  minSize: string;
  maxDepth: string;
  json?: boolean;
}

export async function scanCommand(options: ScanOptions) {
  const spinner = ora('Scanning storage...').start();

  const scannerOptions: ScannerOptions = {
    searchPaths: [options.path],
    olderThanDays: parseInt(options.days),
    minSize: parseInt(options.minSize) * 1024 * 1024, // Convert MB to bytes
    maxDepth: parseInt(options.maxDepth)
  };

  const scanner = new StorageScanner(scannerOptions);

  try {
    let summary;

    switch (options.type) {
      case 'node_modules':
        spinner.text = 'Scanning node_modules...';
        summary = await scanner.scanNodeModules();
        break;
      case 'cache':
        spinner.text = 'Scanning caches...';
        summary = await scanner.scanCaches();
        break;
      case 'browser':
        spinner.text = 'Scanning browser caches...';
        summary = await scanner.scanBrowsers();
        break;
      case 'build':
        spinner.text = 'Scanning build artifacts...';
        summary = await scanner.scanBuilds();
        break;
      case 'ide':
        spinner.text = 'Scanning IDE caches (Cursor, Windsurf, Kiro, n8n, Apple Media Analysis)...';
        summary = await scanner.scanIdes();
        break;
      default:
        spinner.text = 'Scanning all...';
        summary = await scanner.scanAll();
    }

    spinner.succeed('Scan complete!');

    if (options.json) {
      console.log(JSON.stringify(summary, null, 2));
      return;
    }

    console.log('\n' + chalk.bold.cyan('📊 Scan Results\n'));
    console.log(chalk.gray('─'.repeat(80)));

    if (summary.items.length === 0) {
      console.log(chalk.yellow('No items found matching criteria.'));
      return;
    }

    console.log(chalk.bold(`Found ${summary.totalFound} items - Total size: ${formatSize(summary.totalSize)}\n`));

    // Group by type
    const grouped = summary.items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, typeof summary.items>);

    for (const [type, items] of Object.entries(grouped)) {
      const typeSize = items.reduce((sum, item) => sum + item.size, 0);
      const emoji = getTypeEmoji(type);

      console.log(chalk.bold(`\n${emoji} ${type.toUpperCase()} (${items.length} items - ${formatSize(typeSize)})`));
      console.log(chalk.gray('─'.repeat(80)));

      items.slice(0, 10).forEach(item => {
        console.log(
          `${chalk.green(formatSize(item.size).padEnd(12))} ${chalk.gray(item.path)}`
        );
        console.log(`${' '.repeat(14)}${chalk.dim(item.description)}`);
      });

      if (items.length > 10) {
        console.log(chalk.dim(`\n... and ${items.length - 10} more items`));
      }
    }

    console.log('\n' + chalk.gray('─'.repeat(80)));
    console.log(
      chalk.bold.green(`\nTotal recoverable space: ${formatSize(summary.totalSize)}`)
    );
    console.log(chalk.dim('\nRun with --json to get full results in JSON format'));
    console.log(chalk.dim('Run "storagecleaner interactive" to select items to clean\n'));
  } catch (error) {
    spinner.fail('Scan failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

function getTypeEmoji(type: string): string {
  const emojis: Record<string, string> = {
    node_modules: '📦',
    cache: '🗄️',
    browser: '🌐',
    build: '🏗️',
    ide: '🤖'
  };
  return emojis[type] || '📁';
}
