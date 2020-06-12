# Change Log
All notable changes to the "L13 Diff" extension will be documented in this file.

## [0.25.0] - 2020-06-21

### Added
- Added multi panel support.
- Added multi copy support. Please read description for `Copy files to the left/right folder` with `Alt + Click` to see how it works.
- Added button to the top right to toggle ignore end of line.
- Added button to the top right to toggle ignore trim whitespace.

### Fixed
- Fixed copying file for unchanged files.

## [0.24.0] - 2020-06-07

### Added
- Added context menu to copy, delete and reveal a file in the list view.
- Added `l13Diff.ignoreTrimWhitespace` to ignore leading and trailing whitespace in text files.
- Added auto update for list view if a file has been saved and is part of the current comparison.
- Added `l13Diff.confirmCopy` to avoid confirmation dailog. Added also button 'Copy, don't ask again' to dialog.
- Added `l13Diff.confirmDelete` to avoid confirmation dailog. Added also button 'Delete, don't ask again' to dialog.
- Added output messages if files have been copied, deleted or updated.
- Diff panel state will be saved between sessions.
- Added overview ruler for selections in list view to scrollbar.

### Changed
- Changed icons for copy files.

### Fixed
- Fixed navigator if diff panel is open and theme will be changed.

### Removed
- Removed auto selection focus for first menu item, because of usability bug `copy & paste -> enter`.
- Removed info message when files have been copied.

## [0.23.0] - 2020-05-23

### Added
- Added history view for previous comparisons.
- Added welcome view for favorites.
- Added support for `l13Diff.ignore` in local `.vscode/settings.json` files.
- Added auto selection focus for first menu item.
- Added message if no files or folders are found.

### Changed
- Changed status bar text.

### Fixed
- Fixed unused listener for open dialog.
- Fixed selection color for menu.

## [0.22.0] - 2020-04-19

### Added
- Delete selected files and folders with a keyboard shortcut. Press `Cmd + Backspace` on macOS or `Delete` on Windows/Linux in the list view.
- Compare now symbolic links, too.

### Fixed
- Fixed search widget for conflicting files.
- Fixed wrong path in list view for parent copied folders.

## [0.21.0] - 2019-09-22

### Added
- Added support for new extension [L13 Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)
- Alt + Click on swap button changes the list view, too.

## [0.20.0] - 2019-08-25

### Added
- Added options to search widget to filter files and/or folders.
- Added confirm dialog for coping files.
- Added confirm dialog for deleting favorites.
- Added scaling for icons on mouse down like Visual Studio Code.

### Changed
- Closing search widget doesn't clear the input field anymore.

### Removed
- Removed hover color for icons.

## [0.19.0] - 2019-08-11

### Changed
- New icons because Visual Studio Code has new icons.
- Updated screenshots for README.

### Fixed
- Fixed sorting in list view and favorites. [Issue #14](https://github.com/L13/vscode-diff/issues/14)

## [0.18.0] - 2019-07-21

### Added
- Added navigator for the list view.
- Added more details to the stats.
- Added description `Ignored EOL` in list view if file was compared and line endings were ignored.

### Changed
- Switched from element links to event communication for all components.
- Refactored messaging for service/view communication.

### Fixed
- Fixed stats for total entries.
- Fixed `Cmd/Ctrl + Click` in list view. Unselect didn't work correct.

## [0.17.0] - 2019-07-07

### Added
- Added setting `l13Diff.ignoreEndOfLine`. If true different line endings (CR/LF) in text files will be ignored. Default value is `false`.
- Added `L13 Diff` as first favorite to open diff panel with mouse.
- Added dimmed dirnames in list view.
- Added new color for conflicts if file has been changed to folder or vice versa.
- Added output channel for logging and stats.
- Added keyboard shortcut `Cmd/Ctrl + L Cmd/Ctrl + O` to open the output channel.
- Added keyboard shortcut `Cmd/Ctrl + L Cmd/Ctrl + F` to open favorites.
- Added `Click` on statusbar item to open output channel.

### Changed
- Changed icons to be sharper on non retina displays.

## [0.16.0] - 2019-06-23

### Added
- Added favorites explorer and activitybar icon.
- Added an icon (★) in the top right of the diff panel to save a favorite diff.
- Added context menu for favorites to open, rename or delete a favorite diff from the list.
- Added setting `l13Diff.openFavoriteAndCompare` for clicking on a favorite diff in the list.
- Added command `L13 Diff: Delete all favorites` to delete all favorite diffs.
- Added predefined variables `${workspaceFolder}`, `${workspaceFolder:INDEX}` and `${workspaceFolderBasename:NAME}` for paths.
- Added keyboard shortcut `Cmd/Ctrl + D` to save current paths in favorites.

## [0.15.0] - 2019-06-09

### Added
- Added search widget (`Ctrl/Cmd + F`) to filter diff result.
- Added select all in list view with keyboard shortcut `Ctrl/Cmd + A` or button.
- Added `Alt + Double Click` to open diff or file to side.
- Added start screen for keyboard shortcuts.

### Fixed
- Fixed menu visiblity if path was selected and input was clicked again, but menu did not appear.
- Fixed auto link feature of markdown in changelog for VS Code Marketplace.

## [0.14.0] - 2019-05-26

### Added
- Added keyboard support for selecting items in the list view.

### Fixed
- Fixed a bug if an item was select in the menu with enter, but value was not set.
- Fixed async loading bug if VS Code for Windows is running on a virtual machine.
- Fixed invisible selection in input fields for VS Codes default themes.
- Fixed invisible checkbox icon for light themes.
- Fixed scroll into view bug for menu component.
- Fixed a bug if files are selected but copy buttons were still disabled.
- Fixed wrong year in changelog.

## [0.13.0] - 2019-05-12
- Initial release