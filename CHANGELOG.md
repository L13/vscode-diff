# Change Log
All notable changes to the "Diff Folders" extension will be documented in this file.

## [1.3.5] - 2024-01-07

### Fixed

- Fixed UTF-16 optimization.
- Fixed override for system keyboard shortcut `Cmd + L` / `Ctrl + L`. [Issue #145](https://github.com/L13/vscode-diff/issues/145)

## [1.3.4] - 2023-10-06

### Fixed

- Fixed error for multiple disposed panels.

## [1.3.3] - 2023-10-05

### Added

- Added error formatter for more infos.

## [1.3.2] - 2023-05-07

### Fixed

- Fixed dispose panel error.

## [1.3.1] - 2023-04-24

### Fixed

- Fixed `Import Favorites` for placeholder.

## [1.3.0] - 2023-04-23

### Added

- Added `Export Favorites` to export favorites and groups as a JSON file.
- Added `Import Favorites` to import favorites and groups from a JSON file.

### Fixed

- Fixed `Delete All Favorites`.

## [1.2.0] - 2023-04-09

### Added

- Added `l13Diff.enablePreview` to show a preview of a diff or file to the side.

### Fixed

- Fixed Light High Contrast Theme.

## [1.1.0] - 2023-02-26

### Added

- Added `l13Diff.ignoreByteOrderMark` to ignore the BOM in UTF-8 and UTF-16BE text files.
- Added visual context for drag'n drop in the list view.

### Changed

- Changed default value for `l13Diff.ignoreEndOfLine` to true to match Visual Studio Code's Diff Viewer.

### Fixed

- Fixed copy symlink if file or folder does not exist [Issue #104](https://github.com/L13/vscode-diff/issues/104)
- Fixed JSONC parser for trailing comma in an object or array.
- Fixed overwrite existing favorite.

## [1.0.3] - 2021-06-23

### Changed

- Changed `extensionKind` [Issue #98](https://github.com/L13/vscode-diff/issues/98)

## [1.0.2] - 2021-06-13

### Added

- Add `category` for some commands in package.json
- Added minimum support/fix for trusted and remote workspaces.

### Fixed

- Disabled native context menu in diff panel for non input fields.

## [1.0.1] - 2021-05-23

### Fixed

- Fixed scroll position for changes in list view. [Issue #93](https://github.com/L13/vscode-diff/issues/93)

## [1.0.0] - 2021-05-16

### Changed

- Changed panel icon style to new VS Code icon style.

## [0.35.0] - 2021-05-09

### Added

- Added different icons for file and folder comparsions in history view. Previous file comparison opens now in Visual Studio Code Diff Editor. Context menu requires version 0.21.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
- Added `Compare All Side By Side` to favorite groups context menu.
- Added `l13Diff.confirmOpenMultipleDiffPanels` for `Compare All` and `Compare All Side By Side`.

### Fixed

- Fixed flickering context menu in list view.

## [0.34.0] - 2021-05-02

### Added

- Added virtual scrolling in list view.

### Fixed

- Fixed keyboard shortcuts for `Ctrl/Cmd + A` and `Ctrl/Cmd + C` if the focus is on an input box or the command palette.

## [0.33.0] - 2021-04-18

### Added

- Added `Compare` and `Compare in New Panel` to context menu in favorites and history view.
- Added `Copy Left Path` and `Copy Right Path` to context menu in favorites and history view.
- Added `l13Diff.openInNewDiffPanel`.
- Enhanced context menu with `Reveal in Finder/Explorer`, `Open in Integrated Terminal`, `Open Workspace`, `Open as Workspace` and `Add Folders to Workspace` in favorites and history view. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).

### Fixed

- Fixed `Reveal in Finder/Explorer` in list view for broken symbolic links. [Issue #82](https://github.com/L13/vscode-diff/issues/82)

### Changed

- Changed `l13Diff.initialFavoriteGroupState` to `l13Diff.initialFavoriteGroupsState`.
- Changed values for `l13Diff.initialFavoriteGroupsState` to lower case.

### Removed

- Removed `Open` and `Open & Compare` from context menu in favorites and history view.
- Removed `l13Diff.openFavoriteAndCompare`.

## [0.32.0] - 2021-03-21

### Added
- Added updating list view if a file or folder has been deleted in current workspace.
- Supports new version 0.18.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)
- Added `Add to Favorites` to history context menu.

### Changed
- Refactored favorites and history view.

## [0.31.2] - 2021-02-21

### Added
- Added value `compact` to `l13Diff.labelFormat`.
- Added diff settings to output. Same settings are also used for updates.

### Fixed
- Fixed text file detection if a file starts with `.` or has multiple extnames.

## [0.31.1] - 2021-02-14

### Added
- Added `l13Diff.maxFileSize` to ignore files for a comparison that exceed this file size.
- Added file size check for text file comparison. If the file size exceeds the maximum buffer length the files will be treated as binary files.

### Fixed
- Fixed comparing binary files if the file size exceeded the maximum buffer length. [Issue #72](https://github.com/L13/vscode-diff/issues/72)

## [0.31.0] - 2021-01-31

### Added
- Added support for custom keyboard shortcuts.
- Added `l13Diff.enableTrash` which supports `default` (uses `files.enableTrash`), `on` or `off`.
- Added `l13Diff.ignoreContents` for comparing files.
- Added `l13Diff.labelFormat` for different labels formats in the editor tab.

### Changed

- Changed date format in list view for file info to `0000-00-00 00:00:00`.
- Changed all commands for custom keyboard shortcuts.

### Fixed
- Fixed enabled actions for empty list.
- Fixed update list view for deleted files.

## [0.30.1] - 2020-11-08

### Fixed
- Fixed `Go to File` for multiple files.
- Fixed missing description in README for `Go to File`.
- Fixed open to side for multiple files.
- Fixed select all files.

### Changed
- Disabled ui if files will be deleted.
- Disabled drag and drop for error und unknown files.

## [0.30.0] - 2020-11-01

### Added
- Added property `l13Diff.abortOnError` to ignore errors during the scan process.
- Added new list types `error` and `unknown` if an error raises during scan process or an other type is found.
- Added `Show Errors and Others` button to search widget to filter new list types `error` and `unknown`.
- Added `Alt + Click` for left and right input icon to pick a file by dialog.
- Added `Go to File` to context menu. `Click` opens file and `Alt + Click` opens file to side.
- Added file info for size, created and modified to tooltip in list view.

### Fixed
- Fixed display path in copy dialogs and recompared updates.
- Fixed `Cmd + C` for input field in search widget.
- Fixed common path in panel title.
- Fixed typo in views component. [Issue #59](https://github.com/L13/vscode-diff/issues/59)

### Changed

- Changed icon in search widget for conflicts.
- Changed response time for context menu.

## [0.29.0] - 2020-10-11

### Added
- Added high contrast theme support. [Issue #47](https://github.com/L13/vscode-diff/issues/47)

## [0.28.1] - 2020-09-09

### Fixed
- Fixed "trimWhitespace" for big text files. [Issue #49](https://github.com/L13/vscode-diff/issues/49)

## [0.28.0] - 2020-09-06

### Added
- Added `l13Diff.exclude` which replaces `l13Diff.ignore` (depricated). Pleae read the description for the new property.
- Added path segments `**` to `l13Diff.exclude` which allows to exclude complete paths instead of filenames only.
- Added `l13Diff.useCaseSensitiveFileName` which indicates how file names should be treated.
- Added `Disable Case Sensitive` and `Enable Case Sensitive` to toggle `l13Diff.useCaseSensitiveFileName`.
- Added `l13Diff.confirmCaseInsensitiveCompare` for case insensitive compare on a case sensitive file system.
- Added `l13Diff.confirmCaseInsensitiveCopy` for case sensitive file copy on a case insensitive file system.
- Double click on folders in list view opens new Diff Folders panel. Works also with ignored files.

## [0.27.0] - 2020-07-19

### Added
- Added ignored files to list view.
- Added new icon to toggle view for ignored files.
- Added ignored files to stats.
- Added `Select for Compare` and `Compare with Selected` for extension [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)

### Fixed
- Fixed focus bug click into input fields.

### Changed
- Changed `${workspaceFolder:INDEX}` to `${workspaceFolder:NAME}`.

### Removed
- Removed `${workspaceFolder:INDEX}` and `${workspaceFolderBasename:NAME}`. Please use `${workspaceFolder:NAME}` instead.

## [0.26.0] - 2020-07-05

### Added
- Added drag'n drop support for path names in the list view which makes cross diffs possible. Please read the description `List Drag'n Drop` to see how it works.
- Added groups for favorites to group your diffs and open all at once.
- Added `l13Diff.initialFavoriteGroupState` to set the initial state of the groups.

### Changed
- Changed display name for extension from `L13 Diff` to `Diff Folders`.

## [0.25.0] - 2020-06-21

### Added
- Added multi panel support. Open multiple panels by click on the new icon in the favorites view.
- Added multi compare support. Press `Alt + Click` on the button or `Alt + Cmd + C` on macOS or `Alt + Ctrl + C` on Windows/Linux to start a comparison in all panels immediately.
- Added multi copy support. Please read the description `Copy files to the left/right folder` for `Alt + Click` to see how it works.
- Added button to the top right at the panel to toggle `l13Diff.ignoreEndOfLine`.
- Added button to the top right at the panel to toggle `l13Diff.ignoreTrimWhitespace`. If value is `default` the property `diffEditor.ignoreTrimWhitespace` will be changed, otherwise the value will be `on` or `off`.
- Added to see the content of symbolic links in a readonly editor or diff editor.
- Added `Select for Compare`, `Compare with Selected` and `Compare Selected` to explorer list context menu.

### Fixed
- Fixed copying file for unchanged files.
- Fixed `Reveal in Explorer` on windows for folders.
- Fixed losing focus if another tab has been closed.

### Removed
- Removed `Open in L13 Diff` from explorer list context menu.

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
- Added support for new extension [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)
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