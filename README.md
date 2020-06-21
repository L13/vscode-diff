# Diff Folders (L13 Diff)

Compare two folders in Visual Studio Code.

![Diff Folders](images/preview.png)

> This extension is part of the [L13 Extension Pack](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-extension-pack).

## What's new in Diff Folders 0.26.0

- Changed display name for extension from `L13 Diff` to `Diff Folders`.
- Added drag'n drop support for path names in list view.

## Features

* Supports extension [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)
* Supports a history for recently used files, folders and previous comparisons.
* Auto detects current workspaces.
* Select folders with the context menu in the VS Code Explorer or the open dialog.
* Drag'n Drop files and folders from the Finder/Explorer into the input fields.
* Copy files and folders from left to right or vi­ce ver­sa. Symbolic links on Windows can only be copied if Visual Studio Code runs in administrator mode otherwise an error occurs.
* Select all files, folders and symlinks by status.
* Toggle the visiblity of list items by status.
* Double click a file item in the list to open the diff or the file.
* Mouse and keyboard support for selecting items in the list view.
* Search for pathnames to filter diff result.
* Save your favorite diffs and start a comparison immediately.
* Use predefined variables for dynamic pathnames.
* Provides logging and stats for the current diff.
* Get a quick overview with the navigator of the current diff.
* Delete files and folders in the list view.
* Provides a context menu for list items to copy, delete or reveal a file.
* Ignores line endings in text files for a comparison.
* Ignores leading and trailing whitespace in text files.
* Auto updates the list view if a file has been saved in the same window as the comparison.
* Open multiple panels by click on the icon in the favorites view.
* Copy the same files from the same location to multiple folders at once.

### Welcome

![Diff Folders Welcome](images/preview-welcome.png)

### Basics

![Diff Folders Basics](images/preview-start.png)

### Menu

![Diff Folders Menu](images/preview-menu.png)

### Favorites

![Diff Folders Favorites](images/preview-favorites.png)

### History

![Diff Folders History](images/preview-history.png)

### Search, filter or select

![Diff Folders Search](images/preview-search.png)

### List and navigator

![Diff Folders Selection](images/preview-select.png)

### Logging and stats

![Diff Folders Stats](images/preview-stats.png)

### Supports [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)

![Projects](images/preview-l13-projects.png)

## Available Commands

* `Diff Folders` - Open the diff panel.
* `Open in Diff Folders` - Open the diff panel with selected files or folders in the Visual Studio Code Explorer by dialog or context menu.
* `Diff Folders: Clear History` - Clear the history of recently used files, folders and previous comparisons.
* `Diff Folders: Delete All Favorites` - Delete all favorites.

## Available Settings

* `l13Diff.maxRecentlyUsed` - Defines the max length of recently used entries in the menu.
* `l13Diff.openToSide` - Set true if a diff or file should open to the side.
* `l13Diff.ignore` - A list of files and folders which should be ignored. Supports * for names. If the folder for a comparison or one of its parent folders contains the `.vscode/settings.json` file and is not the current workspace folder, the file will be automatically detected and the property will be used for the comparison, too. If the folder is part of the current workspace, the workspace settings will be used instead of the local settings.
* `l13Diff.openFavoriteAndCompare` - Set true if a click on a favorite diff should start a comparison.
* `l13Diff.confirmCopy` - If true confirm dialog for copying files does not appear.
* `l13Diff.confirmDelete` - If true confirm dialog for deleting files does not appear. Is not used if you have to decide which side have to be deleted.
* `l13Diff.ignoreEndOfLine` [1] - Set true if a comparison for text files should ignore line endings (CR/LF).
* `l13Diff.ignoreTrimWhitespace` [1] - Ignores trailing whitespace in text files.
	* `default` - (default) Uses the value of `diffEditor.ignoreTrimWhitespace`.
	* `on` - Ignores leading and trailing whitespace for a comparison in a text file.
	* `off` - Does not ignore leading and trailing whitespace for a comparison in a text file.

[1] Supports only ASCII based and UTF-16 BE/LE encoded files. The text file detection uses the extension name definitions of all installed extensions or the property `files.associations` in the user settings. If a file isn't detected as a text file the extension name has to be added to `files.associations` like `"*.extname": "language"`.

## Predefined Variables

* `${workspaceFolder}` - Use the current workspace folder for the diff e.g. '${workspaceFolder}/path/to/folder'
* `${workspaceFolder:INDEX}` - Use a specific workspace folder by index for the diff e.g. '${workspaceFolder:1}/path/to/folder'
* `${workspaceFolderBasename:NAME}` - Use a specific workspace folder by name for the diff e.g. '${workspaceFolderBasename:workspace-a}/path/to/folder'. If a folder has a closing brace '}' in its name, then the char has to be escaped e.g. '${workspaceFolderBasename:name-{1\\}}'.

## Mouse and Keyboard Shortcuts

### Global

#### macOS

* `Cmd + L Cmd + L` - Open the diff panel.
* `Cmd + D` - Add the current paths to favorites. Diff panel has to be active editor.
* `Cmd + L Cmd + O` - Open the output channel. Provides logging and stats for the current diff.
* `Cmd + L Cmd + F` - Open favorites explorer.

#### Windows / Linux

* `Ctrl + L Ctrl + L` - Open the diff panel.
* `Ctrl + D` - Add the current paths to favorites. Diff panel has to be active editor.
* `Ctrl + L Ctrl + F` - Open favorites explorer.

#### Windows

* `Ctrl + L Ctrl + O` - Open the output channel. Provides logging and stats for the current diff.

If the key bindings don't work, please check `Preferences -> Keyboard Shortcuts`.

### Input/Menu

* `Click` - Select a path in the menu.
* `ArrowUp/ArrowDown` - Move the cursor to the previous/next list item in the menu.
* `Enter` - If the menu is visible, the selected path will be filled in, otherwise a comparison starts.

### Swap Button

#### All platforms

* `Click` - Swaps just the values of the input fields.
* `Alt + Click` - Swaps the values of the input fields and the diff result.

#### macOS

* `Cmd + S` - Same as `Click`.
* `Alt + Cmd + S` - Same as `Alt + Click`.

#### Windows / Linux

* `Ctrl + S` - Same as `Click`.
* `Alt + Ctrl + S` - Same as `Alt + Click`.

### Compare Button

#### All platforms

* `Click` - Start a comparison.
* `Alt + Click` - Start a comparison in all diff panels.

#### macOS

* `Cmd + C` - Same as `Click`.
* `Alt + Cmd + C` - Same as `Alt + Click`.

#### Windows / Linux

* `Ctrl + C` - Same as `Click`.
* `Alt + Ctrl + C` - Same as `Alt + Click`.

### Actions

#### Copy files to the left/right folder.

* `Click` - Copy all selected files to the other folder.
* `Alt + Click` - Copy all selected files in one diff panel in all other diff panels from one source to the other folders at once. Open two or more diff panels and make a comparison with the same folder on the same side. Select all the files you want to copy in one diff panel and press the button with `Alt + Click` to copy all the files from the same source to all other folders, too.

### List

#### All platforms

* `Click` - Select a file or folder in the list view.
* `Shift + Click` - Add files and folders from the last selected item to the current selected item in the list view.
* `Double Click` - Open a diff or file.
* `Alt + Double Click` - Open diff or file to side.
* `Enter` - Same as `Double Click`.
* `Ctrl + Enter` - Same as `Alt + Double Click`.
* `Escape` - Unselect all items in the list view.

#### macOS

* `Cmd + Click` - Add or remove a file or folder to or from the current selection.
* `Cmd + A` - Select all items in the list view.
* `ArrowUp/ArrowDown` - Move the cursor to the previous/next list item.
* `Alt + ArrowUp/ArrowDown` - Move the cursor to the start/end of list view.
* `Shift + ArrowUp/ArrowDown` - Add the previous/next list item to the selection.
* `Shift + Alt + ArrowUp/ArrowDown` - Add all list items until start/end of the list view to the selection.
* `Home/End` - Scroll to the start/end of the list view.
* `PageUp/PageDown` - Scroll to the previous/next page of the list view.
* `Cmd + Backspace` - Delete selected files and folders. Opens a dialog to choose which files (left, right or all) should be deleted.

#### Windows / Linux

* `Ctrl + Click` - Add or remove a file or folder to or from the current selection.
* `Ctrl + A` - Select all items in the list view.
* `ArrowUp/ArrowDown` - Move the cursor to the previous/next list item.
* `Shift + ArrowUp/ArrowDown` - Add the previous/next list item to the selection.
* `Home/End` - Move the cursor to the start/end of list view.
* `Shift + Home/End` - Add all list items until start/end of the list view to the selection.
* `PageUp/PageDown` - Move the cursor to the start/end of the previous/next page of the list view.
* `Shift + PageUp/PageDown` - Add all list items of the previous/next page to the selection.
* `Delete` - Delete selected files and folders. Opens a dialog to choose which files (left, right or all) should be deleted.

### List Context Menu

#### All platforms

* `Copy` - If one or more list items are selected and the icon will be clicked on one of those items all selected files will be copied to the other folder. If the icon will be clicked and the list item isn't seleted only the current file will be copied. This button supports copying files to multiple folders at once with `Alt + Click`, too. Please read the description for `Copy files to the left/right folder` to see how it works.
* `Delete` - If one or more list items are selected and the icon will be clicked on one of those items all selected files will be deleted. If the icon will be clicked and the list item isn't seleted only the current file will be deleted.

#### macOS

* `Reveal in Finder` - Shows the current file in the finder.

#### Windows

* `Reveal in Explorer` - Shows the current file in the explorer.

#### Linux

* `Open Containing Folder` - Shows the current file in the file manager.

### Search Widget

#### All platforms

* `Escape` - Hide search widget.

#### macOS

* `Cmd + F` - Show search widget.
* `Cmd + Alt + C` - Toggle match case.
* `Cmd + Alt + R` - Toggle use regular expression.

#### Windows / Linux

* `Ctrl + F` - Show search widget.
* `Alt + C` - Toggle match case.
* `Alt + R` - Toggle use regular expression.

### Favorites Explorer

* `Click` - Open a favorite diff. If `l13Diff.openFavoriteAndCompare` is true the comparison starts immediately.

#### Context Menu

* `Open` - Open the favorite diff without starting a comparison immediately. Ignores `l13Diff.openFavoriteAndCompare`.
* `Open & Compare` - Open the favorite diff and start a comparison immediately. Ignores `l13Diff.openFavoriteAndCompare`.
* `Rename` - Change the name of the favorite.
* `Delete` - Delete the favorite diff.

### Statusbar

* `Click` - Open the output channel for logging and stats.

### Navigator

* `Click` - Drag'n drop the scrollbar thumb of the navigator to scroll the list or click elsewhere in the navigator and jump to this part of the list.