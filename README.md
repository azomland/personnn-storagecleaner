# 🧹 @personnn/storagecleaner

The ultimate Mac storage cleaner - removes node_modules, caches, build artifacts, IDE files and more. **Simple. Fast. Effective.**

## ✨ Features

- 📦 **node_modules**: Find and remove old, unused node_modules directories
- 🗄️ **Package Manager Caches**: Clean npm, yarn, pnpm, pip, and Homebrew caches
- 🌐 **Browser Caches**: Remove Chrome, Safari, Firefox, Brave, Edge, and Arc caches
- 🏗️ **Build Artifacts**: Clean dist, build, .next, .turbo, and other build folders
- 🤖 **IDE Caches**: Clean Cursor, Windsurf, Kiro, n8n, and Apple Media Analysis bloat
- 🦞 **OpenClaw Traces**: Find and remove OpenClaw data, config, and startup launch agents
- 🎯 **Interactive Mode**: Select exactly what you want to clean
- � **Size E:stimation**: See exactly how much space you'll recover
- 🔒 **Safe**: Confirmation prompts and dry-run mode
- ⚡ **Fast**: Efficient scanning using native tools

## 🚀 Installation

```bash
# 1. Configure the Personnn registry (only once)
npm config set @personnn:registry https://registry.personnn.com

# 2. Install globally
npm install -g @personnn/storagecleaner
```

That's it! Now you can use `storagecleaner` or `sc` from anywhere.

## 📖 Usage

### Interactive Mode (Recommended)

```bash
storagecleaner interactive
# or
sc i
```

This will guide you through:
1. Selecting what to scan (node_modules, caches, browsers, builds, IDEs, or all)
2. Showing you everything found with sizes
3. Letting you choose exactly what to clean
4. Confirming before deletion

### Scan Mode

Just see what's taking up space without cleaning:

```bash
# Scan everything
storagecleaner scan

# Scan specific type
storagecleaner scan --type node_modules
storagecleaner scan --type cache
storagecleaner scan --type browser
storagecleaner scan --type build
storagecleaner scan --type ide
storagecleaner scan --type openclaw

# Scan with filters
storagecleaner scan --days 30          # Only items older than 30 days
storagecleaner scan --min-size 100     # Only items larger than 100MB
storagecleaner scan --path ~/projects  # Scan specific directory

# Get JSON output
storagecleaner scan --json > results.json
```

### Clean Mode

Clean storage with confirmations:

```bash
# Clean everything (with confirmation)
storagecleaner clean

# Clean specific type
storagecleaner clean --type node_modules
storagecleaner clean --type cache

# Clean old items only
storagecleaner clean --days 60  # Only clean items older than 60 days

# Dry run (see what would be deleted)
storagecleaner clean --dry-run

# Force (skip confirmation)
storagecleaner clean --force
```

## 🎯 What Gets Cleaned?

### node_modules (📦)
- Searches recursively for `node_modules` directories
- Shows last modified date and project name
- Safe to delete - just run `npm install` again when needed

### Caches (🗄️)
- **npm**: `~/.npm`
- **yarn**: `~/.yarn/cache`
- **pnpm**: `~/Library/Caches/pnpm`
- **Homebrew**: `~/Library/Caches/Homebrew`
- **pip**: `~/Library/Caches/pip` and `~/.cache/pip`
- **Turborepo**: `~/Library/Caches/turborepo`
- **Next.js**: `~/Library/Caches/next.js`

### Browser Caches (🌐)
- **Chrome**: `~/Library/Caches/Google/Chrome`
- **Safari**: `~/Library/Caches/com.apple.Safari`
- **Firefox**: `~/Library/Caches/Firefox`
- **Brave**: `~/Library/Caches/BraveSoftware/Brave-Browser`
- **Edge**: `~/Library/Caches/Microsoft Edge`
- **Arc**: `~/Library/Caches/company.thebrowser.Browser`

### Build Artifacts (🏗️)
- `dist/`, `build/`, `.next/`, `out/`, `.turbo/`, `.cache/`, `coverage/`

### IDE & System Caches (🤖)
- **Cursor**: `~/.cursor`, `~/Library/Application Support/Cursor`
- **Windsurf**: `~/.windsurf`, `~/Library/Application Support/Windsurf`
- **Kiro**: `~/.kiro`
- **n8n**: `~/.n8n`
- **Apple Media Analysis**: `~/Library/Containers/com.apple.mediaanalysisd` (safe to delete!)

### OpenClaw Traces (🦞)
- **Data**: `~/.openclaw`
- **Config**: `~/.config/openclaw`
- **Local Share**: `~/.local/share/openclaw`
- **Startup File**: `~/Library/LaunchAgents/ai.openclaw.gateway.plist` (removes background auto-start)
- **Processes**: Automatically detects and terminates running OpenClaw gateway instances via `pkill`

## 🔧 Options

### Common Options

- `-p, --path <path>`: Directory to scan (default: `~`)
- `-t, --type <type>`: What to scan/clean (`all`, `node_modules`, `cache`, `browser`, `build`, `ide`, `openclaw`)
- `-d, --days <days>`: Only items older than N days
- `-s, --min-size <size>`: Minimum size in MB (scan only)
- `--max-depth <depth>`: Maximum search depth (default: 5)

### Clean Options

- `-f, --force`: Skip confirmation prompts
- `--dry-run`: Show what would be deleted without actually deleting

## 💡 Examples

```bash
# Find all node_modules older than 30 days
storagecleaner scan --type node_modules --days 30

# Clean all browser caches
storagecleaner clean --type browser --force

# Clean IDE caches (Cursor, Windsurf, etc.)
storagecleaner clean --type ide

# See what would be cleaned (dry run)
storagecleaner clean --dry-run

# Clean only large items
storagecleaner scan --min-size 500
storagecleaner interactive  # Then select the large items

# Clean specific directory
storagecleaner clean --path ~/projects --type build

# Stop and remove OpenClaw traces (including launch agents)
storagecleaner clean --type openclaw --force
```

## 🛡️ Safety Features

- **Confirmation prompts**: Always asks before deleting (unless `--force`)
- **Dry run mode**: See what would be deleted without actually deleting
- **Excludes system folders**: Never touches `/System`, `/Library` (root), etc.
- **Error handling**: Continues even if some items fail to delete
- **Detailed reporting**: Shows what succeeded and what failed

## 📊 Performance

Typical scan of home directory (~):
- **node_modules**: ~30-60 seconds
- **Caches**: ~5-10 seconds
- **Everything**: ~1-2 minutes

## 📝 License

**Free for personal use.** Commercial use requires a license ($99/year).

See full license: https://personnn.com/license/storagecleaner

## � LLinks

- **Registry**: https://registry.personnn.com
- **License**: https://personnn.com/license/storagecleaner
- **Support**: support@personnn.com

---

**Made with 💙 by [Personnn](https://personnn.com)**

*Clean storage, clear mind* 🧘‍♂️
