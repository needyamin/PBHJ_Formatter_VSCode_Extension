# Change Log

All notable changes to the "pbhj-advanced-formatter" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.0] - 2025-10-07
-
## [1.0.2] - 2025-10-07
- Bundle runtime dependencies in VSIX to ensure activation without prompts
- Add startup activation and Shift+Alt+P keybinding
- Initial stable release
- Added HTML/JS formatting via Prettier
- Added PHP formatting via @prettier/plugin-php
- Added Blade formatting via blade-formatter
- Added debug visuals: status bar, background tint, closing tag highlights
 
## [1.0.15] - 2025-10-17
- Remove automatic document formatting providers (no auto format on save/type)
- Change activation to command-only
- Documentation updates (README)

## [1.0.16] - 2025-10-17
- Add Windows keybinding: Ctrl+F for PBHJ: Format Document

## [1.0.17] - 2025-10-17
- Include runtime dependencies (Prettier, @prettier/plugin-php, blade-formatter) in VSIX
- Fix runtime error: Cannot find package 'prettier'