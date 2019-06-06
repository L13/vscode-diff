# L13 Diff

Compare two folders in Visual Studio Code.

![L13 Diff](images/preview.png)

## What's new in L13 Diff 0.15.0

- Added search widget (`Ctrl/Cmd + F`) to filter diff result.
- Added select all in list view with keyboard shortcut `Ctrl/Cmd + A` or button.
- Added `Alt + Double Click` to open diff or file to side.
- Added welcome screen for keyboard shortcuts.

## Features

* Supports a history for recently used folders.
* Auto detects current workspaces.
* Select folders with the context menu in the VS Code Explorer or the open dialog.
* Drag'n Drop folders from the VS Code Explorer or from the Finder/Explorer into the input fields.
* Copy files from left to right or vi­ce ver­sa.
* Select all files and folders by status.
* Toggle the view by status.
* Double click an item in the list to open the diff or the file.
* Mouse and keyboard support for selecting items in list.
* Search for pathnames to filter diff result.

Select a folder with the dialog, swap the paths and compare two files or folders.

![L13 Diff Basics](images/preview-start.png)

Select from recently used, current workspaces or drag'n drop folders into the input fields.

![L13 Diff Menu](images/preview-menu.png)

Toggle the view, select files by status or copy files from left to right or vice versa.

![L13 Diff List](images/preview-diff.png)

## Available Commands

* `L13 Diff` - Open the diff panel.
* `Open in L13 Diff` - Open the diff panel with selected files or folders by dialog or context menu.
* `L13 Diff: Clear History` - Clear the history of recently used files and folders.

## Available Settings

* `l13Diff.maxRecentlyUsed` - Defines the max length of recently used entries in the menu.
* `l13Diff.openToSide` - Set true if a diff or file should open to the side.
* `l13Diff.ignore` - A list of files and folders which should be ignored. Supports * for names.

## Global Keyboard Shortcuts

macOS

* `Cmd + L Cmd + L` - Open the diff panel.

Windows / Linux

* `Ctrl + L Ctrl + L` - Open the diff panel.

If the key bindings don't work, please check `Preferences -> Keyboard Shortcuts`.

## Input/Menu Mouse/Keyboard Shortcuts

* `Click` - Select a path in the menu.
* `ArrowUp/ArrowDown` - Move the cursor to the previous/next list item in menu.
* `Enter` - If the menu is visible, the selected path will be filled in, otherwise a compare starts.

## List Mouse/Keyboard Shortcuts

All platforms

* `Click` - Select a file or folder in the list view.
* `Shift + Click` - Add files and folders from the last selected item to the current selected item in the list view.
* `Double Click` - Open a diff or file.
* `Alt + Double Click` - Open diff or file to side.
* `Enter` - Open diff or file.
* `Ctrl + Enter` - Open diff or file to side.
* `Escape` - Unselect all items in the list view.

macOS

* `Cmd + Click` - Add or remove a file or folder to or from the current selection.
* `Cmd + A` - Select all items in the list view.
* `ArrowUp/ArrowDown` - Move the cursor to the previous/next list item.
* `Alt + ArrowUp/ArrowDown` - Move the cursor to the start/end of list view.
* `Shift + ArrowUp/ArrowDown` - Add the previous/next list item to the selection.
* `Shift + Alt + ArrowUp/ArrowDown` - Add all list items until start/end of the list view to the selection.
* `Home/End` - Scroll to the start/end of the list view.
* `PageUp/PageDown` - Scroll to the previous/next page of the list view.

Windows / Linux

* `Ctrl + Click` - Add or remove a file or folder to or from the current selection.
* `Ctrl + A` - Select all items in the list view.
* `ArrowUp/ArrowDown` - Move the cursor to the previous/next list item.
* `Shift + ArrowUp/ArrowDown` - Add the previous/next list item to the selection.
* `Home/End` - Move the cursor to the start/end of list view.
* `Shift + Home/End` - Add all list items until start/end of the list view to the selection.
* `PageUp/PageDown` - Move the cursor to the start/end of the previous/next page of the list view.
* `Shift + PageUp/PageDown` - Add all list items of the previous/next page to the selection.

## Search Widget Keyboard Shortcuts

All platforms

* `Escape` - Hide search widget.

macOS

* `Cmd + F` - Show search widget.
* `Cmd + Alt + C` - Toggle match case.
* `Cmd + Alt + R` - Toggle use regular expression.

Windows / Linux

* `Ctrl + F` - Show search widget.
* `Alt + C` - Toggle match case.
* `Alt + R` - Toggle use regular expression.