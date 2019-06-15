# Change Log
All notable changes to the "L13 Diff" extension will be documented in this file.

## [0.16.0] - 2019-06-23

### Added
- Added favorites explorer and activitybar icon.
- Added an icon (★) in the top right of the diff panel to add a favorite.
- Added context menu to open or remove favorites in the list.
- Added setting `l13Diff.openFavoriteAndCompare` for click on a favorite in the list.
- Added command `L13 Diff: Remove all favorites` to delete all favorites.

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