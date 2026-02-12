# Contributing to personnn-storagecleaner

Thanks for your interest in contributing! 🎉

## Development Setup

```bash
# Clone and install
git clone <repo>
cd personnn-storagecleaner
npm install

# Build
npm run build

# Development mode (auto-reload)
npm run dev -- interactive
```

## Project Structure

```
src/
├── scanners/          # Storage scanners
│   ├── node-modules-scanner.ts
│   ├── cache-scanner.ts
│   ├── browser-scanner.ts
│   └── build-scanner.ts
├── cleaners/          # Cleaning logic
│   └── storage-cleaner.ts
├── cli/               # CLI commands
│   ├── commands/
│   └── index.ts
└── utils/             # Utilities
    ├── file-utils.ts
    └── format.ts
```

## Adding a New Scanner

1. Create a new file in `src/scanners/`
2. Implement the scanner class
3. Export it from `src/scanners/index.ts`
4. Add it to the `StorageScanner.scanAll()` method

Example:

```typescript
export class MyScanner {
  async scan(): Promise<ScanResult[]> {
    // Your scanning logic
    return results;
  }
}
```

## Adding a New Cache Location

Edit `src/scanners/cache-scanner.ts` and add your cache location to the `cacheLocations` array:

```typescript
{
  path: path.join(home, 'your/cache/path'),
  description: 'Your Cache Name',
  type: 'cache' as const
}
```

## Testing

```bash
# Test scan
npm run dev -- scan --path /tmp --type all

# Test interactive
npm run dev -- interactive

# Test clean (dry run)
npm run dev -- clean --dry-run --path /tmp
```

## Code Style

- Use TypeScript
- Follow existing code style
- Add types for everything
- Use async/await
- Handle errors gracefully

## Pull Requests

1. Fork the repo
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a PR

## Ideas for Contributions

- [ ] Add more cache locations
- [ ] Support for Linux/Windows
- [ ] Configuration file support
- [ ] Scheduled auto-cleaning
- [ ] Better error reporting
- [ ] Progress bars for large operations
- [ ] Export reports
- [ ] GUI version
- [ ] Docker images scanner
- [ ] Git repository cleaner

## Questions?

Open an issue or reach out to the personnn team!
