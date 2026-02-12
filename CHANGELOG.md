# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025-11-22

### 🎉 Initial Release

#### Features

- **Scanners**
  - 📦 node_modules scanner - Find all node_modules directories recursively
  - 🗄️ Cache scanner - npm, yarn, pnpm, pip, Homebrew, Turborepo, Next.js
  - 🌐 Browser scanner - Chrome, Safari, Firefox, Brave, Edge, Arc
  - 🏗️ Build artifacts scanner - dist, build, .next, out, .turbo, coverage

- **CLI Commands**
  - `scan` - Scan and report storage usage
  - `clean` - Clean storage with confirmation
  - `interactive` - Interactive mode with item selection

- **Options**
  - Filter by type (node_modules, cache, browser, build, all)
  - Filter by age (--days)
  - Filter by size (--min-size)
  - Custom search paths
  - Max depth control
  - JSON output support
  - Dry run mode
  - Force mode (skip confirmations)

- **Safety Features**
  - Confirmation prompts before deletion
  - Dry run mode to preview changes
  - Error handling and reporting
  - Excludes system directories
  - Detailed success/failure reporting

- **User Experience**
  - Interactive selection with checkboxes
  - Colored output with emojis
  - Progress spinners
  - Size formatting (human-readable)
  - Grouped results by type
  - Clear error messages

### Technical

- Built with TypeScript
- Uses fast-glob for efficient searching
- Commander.js for CLI
- Inquirer.js for interactivity
- Chalk for colors
- Ora for spinners

### Documentation

- Comprehensive README
- Usage examples
- Contributing guide
- Example configuration
