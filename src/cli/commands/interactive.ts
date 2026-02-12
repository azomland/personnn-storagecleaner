import chalk from 'chalk';
import ora from 'ora';
import inquirer from 'inquirer';
import { StorageScanner } from '../../scanners/index.js';
import { StorageCleaner } from '../../cleaners/storage-cleaner.js';
import { formatSize } from '../../utils/format.js';
import { ScannerOptions, ScanResult } from '../../types.js';

interface InteractiveOptions {
  path: string;
}

export async function interactiveCommand(options: InteractiveOptions) {
  console.log(chalk.bold.cyan('🧹 Interactive Storage Cleaner\n'));

  // Step 1: Choose what to scan
  const { scanType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'scanType',
      message: 'What would you like to scan?',
      choices: [
        { name: '🔍 Everything (recommended)', value: 'all' },
        { name: '📦 node_modules only', value: 'node_modules' },
        { name: '🗄️  Package manager caches (npm, yarn, pnpm, etc.)', value: 'cache' },
        { name: '🌐 Browser caches', value: 'browser' },
        { name: '🏗️  Build artifacts (dist, build, .next, etc.)', value: 'build' },
        { name: '🤖 IDE caches (Cursor, Windsurf, Kiro, n8n, Apple Media Analysis)', value: 'ide' }
      ]
    }
  ]);

  // Step 2: Scan
  const spinner = ora('Scanning...').start();

  const scannerOptions: ScannerOptions = {
    searchPaths: [options.path],
    maxDepth: 5
  };

  const scanner = new StorageScanner(scannerOptions);

  try {
    let summary;

    switch (scanType) {
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

    spinner.succeed(`Found ${summary.totalFound} items - ${formatSize(summary.totalSize)}`);

    if (summary.items.length === 0) {
      console.log(chalk.yellow('\n✨ Nothing to clean! Your system is already clean.'));
      return;
    }

    // Step 3: Group items and let user select
    const grouped = summary.items.reduce((acc, item) => {
      if (!acc[item.type]) {
        acc[item.type] = [];
      }
      acc[item.type].push(item);
      return acc;
    }, {} as Record<string, ScanResult[]>);

    // Create choices for selection
    const choices = [];

    for (const [type, items] of Object.entries(grouped)) {
      const typeSize = items.reduce((sum, item) => sum + item.size, 0);
      const emoji = getTypeEmoji(type);

      choices.push(new inquirer.Separator(`\n${chalk.bold(`${emoji} ${type.toUpperCase()} - ${items.length} items (${formatSize(typeSize)})`)}`));

      items.forEach(item => {
        choices.push({
          name: `${formatSize(item.size).padEnd(12)} ${item.description}`,
          value: item.path,
          short: item.path
        });
      });
    }

    const { selectedPaths } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedPaths',
        message: 'Select items to clean (Space to select, Enter to continue):',
        choices,
        pageSize: 15
      }
    ]);

    if (selectedPaths.length === 0) {
      console.log(chalk.yellow('\nNo items selected.'));
      return;
    }

    // Calculate selected size
    const selectedItems = summary.items.filter(item => selectedPaths.includes(item.path));
    const selectedSize = selectedItems.reduce((sum, item) => sum + item.size, 0);

    // Step 4: Confirm
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Delete ${selectedPaths.length} items (${formatSize(selectedSize)})?`,
        default: false
      }
    ]);

    if (!confirm) {
      console.log(chalk.yellow('\nCancelled.'));
      return;
    }

    // Step 5: Clean
    const cleanSpinner = ora('Cleaning...').start();
    const cleaner = new StorageCleaner();

    const results = await cleaner.clean(summary.items, {
      selected: selectedPaths
    });

    cleanSpinner.succeed('Done!');

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
  } catch (error) {
    spinner.fail('Operation failed');
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
