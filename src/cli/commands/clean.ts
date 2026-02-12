import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { StorageScanner } from '../../scanners/index.js';
import { StorageCleaner } from '../../cleaners/storage-cleaner.js';
import { formatSize } from '../../utils/format.js';
import { ScannerOptions } from '../../types.js';

interface CleanOptions {
  path: string;
  type: string;
  days: string;
  force?: boolean;
  dryRun?: boolean;
}

export async function cleanCommand(options: CleanOptions) {
  const spinner = ora('Scanning storage...').start();

  const scannerOptions: ScannerOptions = {
    searchPaths: [options.path],
    olderThanDays: parseInt(options.days),
    maxDepth: 5
  };

  const scanner = new StorageScanner(scannerOptions);

  try {
    let summary;

    switch (options.type) {
      case 'node_modules':
        summary = await scanner.scanNodeModules();
        break;
      case 'cache':
        summary = await scanner.scanCaches();
        break;
      case 'browser':
        summary = await scanner.scanBrowsers();
        break;
      case 'build':
        summary = await scanner.scanBuilds();
        break;
      case 'ide':
        summary = await scanner.scanIdes();
        break;
      default:
        summary = await scanner.scanAll();
    }

    spinner.succeed('Scan complete!');

    if (summary.items.length === 0) {
      console.log(chalk.yellow('\nNo items found to clean.'));
      return;
    }

    console.log('\n' + chalk.bold.cyan('🧹 Items to clean\n'));
    console.log(chalk.bold(`Found ${summary.totalFound} items - Total size: ${formatSize(summary.totalSize)}\n`));

    if (options.dryRun) {
      console.log(chalk.yellow('DRY RUN MODE - Nothing will be deleted\n'));
    }

    // Show items grouped by type
    const grouped = summary.items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, typeof summary.items>);

    for (const [type, items] of Object.entries(grouped)) {
      const typeSize = items.reduce((sum, item) => sum + item.size, 0);
      console.log(chalk.bold(`${type}: ${items.length} items - ${formatSize(typeSize)}`));
    }

    // Confirm before cleaning
    if (!options.force && !options.dryRun) {
      const answer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `Are you sure you want to delete ${summary.totalFound} items (${formatSize(summary.totalSize)})?`,
          default: false
        }
      ]);

      if (!answer.confirm) {
        console.log(chalk.yellow('\nCancelled.'));
        return;
      }
    }

    // Clean
    const cleaner = new StorageCleaner();
    const cleanSpinner = ora('Cleaning...').start();

    const results = await cleaner.clean(summary.items, {
      dryRun: options.dryRun
    });

    cleanSpinner.succeed('Cleaning complete!');

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const totalCleaned = successful.reduce((sum, r) => sum + r.size, 0);

    console.log('\n' + chalk.bold.green('✨ Results\n'));
    console.log(chalk.green(`Successfully cleaned: ${successful.length} items (${formatSize(totalCleaned)})`));

    if (failed.length > 0) {
      console.log(chalk.red(`Failed: ${failed.length} items`));
      console.log('\n' + chalk.bold.red('Failed items:'));
      failed.forEach(item => {
        console.log(chalk.red(`  ${item.path}`));
        console.log(chalk.dim(`    ${item.error}`));
      });
    }

    if (options.dryRun) {
      console.log(chalk.yellow('\n⚠️  This was a dry run - nothing was actually deleted'));
    }
  } catch (error) {
    spinner.fail('Operation failed');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
