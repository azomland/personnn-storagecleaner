#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { scanCommand } from './commands/scan.js';
import { cleanCommand } from './commands/clean.js';
import { interactiveCommand } from './commands/interactive.js';

const program = new Command();

program
  .name('storagecleaner')
  .description('🧹 The ultimate Mac storage cleaner')
  .version('1.0.0');

program
  .command('scan')
  .description('Scan for storage that can be cleaned')
  .option('-p, --path <path>', 'Path to scan (default: ~)', '~')
  .option('-t, --type <type>', 'Type to scan: all, node_modules, cache, browser, build, ide', 'all')
  .option('-d, --days <days>', 'Only show items older than N days', '0')
  .option('-s, --min-size <size>', 'Minimum size in MB', '0')
  .option('--max-depth <depth>', 'Maximum search depth', '5')
  .option('--json', 'Output as JSON')
  .action(scanCommand);

program
  .command('clean')
  .description('Clean storage')
  .option('-p, --path <path>', 'Path to scan (default: ~)', '~')
  .option('-t, --type <type>', 'Type to clean: all, node_modules, cache, browser, build, ide', 'all')
  .option('-d, --days <days>', 'Only clean items older than N days', '0')
  .option('-f, --force', 'Skip confirmation', false)
  .option('--dry-run', 'Show what would be deleted without actually deleting', false)
  .action(cleanCommand);

program
  .command('interactive')
  .alias('i')
  .description('Interactive mode - select what to clean')
  .option('-p, --path <path>', 'Path to scan (default: ~)', '~')
  .action(interactiveCommand);

program.parse();
