## PBHJ Advanced Formatter

Advanced, fast, and reliable formatter for HTML, JavaScript, PHP, and Blade (`.blade.php`).

### Features
- One-click formatting via command: PBHJ: Format Document
- No auto-format on save or on type (explicit command only)
- HTML/JS formatted by Prettier
- PHP formatted by Prettier with `@prettier/plugin-php`
- Blade formatted by `blade-formatter`
- Configurable options under `PBHJ Advanced Formatter` settings

### Usage
- Run command: PBHJ: Format Document (keybindings: Shift+Alt+P, Ctrl+F on Windows)

### Settings
- `pbhjFormatter.printWidth` (default: 100)
- `pbhjFormatter.tabWidth` (default: 2)
- `pbhjFormatter.useTabs` (default: false)
- `pbhjFormatter.semi` (default: true)
- `pbhjFormatter.singleQuote` (default: true)
- `pbhjFormatter.blade.wrapAttributes` (default: "auto")

### Notes
- The extension bundles Prettier, `@prettier/plugin-php`, and `blade-formatter`. It respects your workspace settings above for consistent formatting.
