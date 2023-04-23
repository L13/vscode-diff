# Diff Folders

Compare two folders in Visual Studio Code.

![Diff Folders](images/previews/preview.png)

## What's new in Diff Folders 1.3.0

- Added `Export Favorites` to export favorites and groups as a JSON file.
- Added `Import Favorites` to import favorites and groups from a JSON file.

## Index

1. [Available Commands](#available-commands)
1. [Available Settings](#available-settings)
1. [Predefined Variables](#predefined-variables)
1. [Mouse and Keyboard Shortcuts](#mouse-and-keyboard-shortcuts)
1. [Custom Keybindings](#custom-keybindings)
1. [Workspace Trust](#workspace-trust)
1. [Recommended Settings](#recommended-settings)
1. [Recommended Extensions](#recommended-extensions)

### Basics

![Diff Folders Basics](images/previews/preview-start.png)

### Favorites

![Diff Folders Favorites](images/previews/preview-favorites.png)

### Search, Filter or Select

![Diff Folders Search](images/previews/preview-search.png)

### List and Navigator

![Diff Folders Selection](images/previews/preview-select.png)

### Logging and Stats

![Diff Folders Stats](images/previews/preview-stats.png)

### Supports the Extension [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)

![Projects](images/previews/preview-projects.png)

## Available Commands

* `New Diff Panel` - Open the diff panel.
* `Clear History` - Clear the history of recently used files, folders and previous comparisons.
* `Delete All Favorites` - Delete all favorites.
* `Show Output Channel` - Open the output channel for the current comparison.
* `Export Favorites` - Export all favorites and groups to a JSON file.
* `Import Favorites` - Import favorites and groups from a JSON file. The limit is 1000 entries.

## Available Settings

* `l13Diff.maxRecentlyUsed` - Defines the max length of recently used entries in the menu.
* `l13Diff.openToSide` - Set true if a diff or file should open to the side.
* `l13Diff.abortOnError` - If false scan process will not be canceled if an error occurs.
* `l13Diff.useCaseSensitiveFileName` - Indiciates if filenames should be treated as case sensitive for a comparison. This also affects the property `l13Diff.exclude`.
	* `detect` - (default) Detect the file system case sensitivity.
	* `on` - Enable case sensitive file names.
	* `off` - Disable case sensitive file names.
* `l13Diff.exclude` - A list of files and folders which should be ignored. If the folder for a comparison or one of its parent folders contains the `.vscode/settings.json` file and is not the current workspace folder, the file will be automatically detected and the values of the property will also be used for the comparison. If the folder is part of the current workspace, the workspace settings will be used instead of the local settings. Supports the following glob patterns:
	* `*` matches zero or more characters in a path segment e.g. `*.txt`.
	* `?` matches on one character in a path segment.
	* `**` matches any number of path segments including none e.g. `**/node_modules`.
* `l13Diff.openInNewDiffPanel` - If true a click on a favorite diff or a previous comparison opens in a new diff panel.
* `l13Diff.confirmCaseInsensitiveCompare` - If false confirm dialog for comparing case insensitive on a case sensitive file system does not appear.
* `l13Diff.confirmCopy` - If false confirm dialog for copying files does not appear.
* `l13Diff.confirmCaseInsensitiveCopy` - If false confirm dialog for copying case sensitive on a case insensitive file system does not appear.
* `l13Diff.confirmDelete` - If false confirm dialog for deleting files does not appear. Is not used if you have to decide which side have to be deleted.
* `l13Diff.confirmOpenMultipleDiffPanels` - If true `Compare All` and `Compare All Side By Side` shows a dialog if more than 3 diff panels will be opened at once.
* `l13Diff.initialFavoriteGroupsState` - Set the initial state of a group.
	* `remember` - (default) Remember the collpased and expanded state of each group.
	* `collapsed` - Show all groups collapsed at start.
	* `expanded` - Show all groups expanded at start.
* `l13Diff.labelFormat` - Indicates how the label of a tab should be formatted.
	* `complete` - (default) Show relative paths including the common path.
	* `compact` - Show relative paths including base folders.
	* `relative` - Show only the relative paths.
	* `filename` - Show only the filenames.
* `l13Diff.ignoreContents` - If true files will only be compared by size and the contents will be ignored.
* `l13Diff.maxFileSize` - Indicates the maximum file size in MB for a comparison. If the value is 0 no limit is used instead.
* `l13Diff.ignoreEndOfLine` [1] - Set true if a comparison for text files should ignore line endings (CR/LF).
* `l13Diff.ignoreTrimWhitespace` [1] - Ignores leading and trailing whitespace in text files.
	* `default` - (default) Uses the value of `diffEditor.ignoreTrimWhitespace`.
	* `on` - Ignores leading and trailing whitespace for a comparison in a text file.
	* `off` - Does not ignore leading and trailing whitespace for a comparison in a text file.
* `l13Diff.ignoreByteOrderMark` [1] - Set true if a comparison should ignore the BOM in UTF-8 or UTF-16BE text files.
* `l13Diff.enableTrash` - Moves files and folders to the OS trash when deleting or delete files and folders permanently.
	* `default` - (default) Uses the value of `files.enableTrash`.
	* `on` - Moves files and folders to the OS trash.
	* `off` - Deletes files and folders permanently.

[1] Supports only ASCII based and UTF-16 BE/LE encoded files. The text file detection uses the extension name definitions of all installed extensions or the property `files.associations` in the user settings. If a file isn't detected as a text file the extension name has to be added to `files.associations` like `"*.extname": "language"`. If the file size exceeds the maximum buffer length the file will be treated as a binary file.

## Predefined Variables

* `${workspaceFolder}` - Use the current workspace folder for the diff e.g. `${workspaceFolder}/path/to/folder`
* `${workspaceFolder:NAME}` - Use a specific workspace folder by name for the diff e.g. `${workspaceFolder:workspace-a}/path/to/folder`. If a folder has a closing brace `}` in its name the char has to be escaped like `${workspaceFolder:name-{1\}}`.

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

### Input Menu

* `Click` - Select a path in the menu.
* `ArrowUp/ArrowDown` - Move the cursor to the previous/next list item in the menu.
* `Enter` - If the menu is visible, the selected path will be filled in, otherwise a comparison starts.
* `Escape` - Hide the menu if visible.

### Input Icon

* `Click` - Open dialog to pick a folder.
* `Alt + Click` - Open dialog to pick a file.

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

### Status Buttons

#### macOS

* `Alt + Cmd + 1` - Toggle `Show All Unchanged Files`
* `Alt + Cmd + 2` - Toggle `Show All Deleted Files`
* `Alt + Cmd + 3` - Toggle `Show All Modified Files`
* `Alt + Cmd + 4` - Toggle `Show All Created Files`
* `Alt + Cmd + 5` - Toggle `Show All Ignored Files`

#### Windows / Linux

* `Alt + Ctrl + 1` - Toggle `Show All Unchanged Files`
* `Alt + Ctrl + 2` - Toggle `Show All Deleted Files`
* `Alt + Ctrl + 3` - Toggle `Show All Modified Files`
* `Alt + Ctrl + 4` - Toggle `Show All Created Files`
* `Alt + Ctrl + 5` - Toggle `Show All Ignored Files`

### Compare Button

#### All Platforms

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

#### All Platforms

* `Click` - Select a file or folder in the list view.
* `Shift + Click` - Add files and folders from the last selected item to the current selected item in the list view.
* `Double Click` - Open a diff or file.
* `Alt + Double Click` - Open diff or file to side.
* `Enter` - Same as `Double Click`.
* `Ctrl + Enter` - Same as `Alt + Double Click`.
* `Escape` - Unselect all items in the list view.
* `Space` - Show preview of diff or file to side if `l13Diff.enablePreview` is true. If multiple files are selected the last selection will be opened as a preview and the rest will be opened like `Double Click`.

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

#### All Platforms

* `Copy` - If one or more list items are selected and the icon will be clicked on one of those items all selected files will be copied to the other folder. If the icon will be clicked and the list item isn't seleted only the current file will be copied. This button supports copying files to multiple folders at once with `Alt + Click`, too. Please read the description for `Copy files to the left/right folder` to see how it works.
* `Go to File` - If one or more list items are selected and the icon will be clicked on one of those items all selected files will be opened. If the icon will be clicked and the list item isn't seleted only the current file will be opened.
* `Delete` - If one or more list items are selected and the icon will be clicked on one of those items all selected files will be deleted. If the icon will be clicked and the list item isn't seleted only the current file will be deleted.

#### macOS

* `Reveal in Finder` - Shows the current file in the finder.

#### Windows

* `Reveal in File Explorer` - Shows the current file in the explorer.

#### Linux

* `Open Containing Folder` - Shows the current file in the file manager.

### List Drag'n Drop

* `Drag'n Drop` - Drag a path in the list view to another path of the same type (file, folder or symbolic link) and let it drop to open a diff with these two files. Paths can also be dropped into the input fields and the search widget.

### List Tooltip

* Shows the full path, the size, the creation and modification time and date of a file.

### List Info

If `l13Diff.ignoreByteOrderMark`, `l13Diff.ignoreEndOfLine` or `l13Diff.ignoreTrimWhitespace` is true a file will be modified for a comparison. An info appears on the right side of the filename in the list view to see which changes has been done. The information is only visible for files where the modification results in **unchanged**.

* `Ignored EOL` - Line endings have been converted from Windows to Unix.
* `Ignored BOM` - Byte Order Mark for a UTF-8 and UTF-16BE file has been removed.
* `Ignored Whitespace` - Leading and trailing whitespaces have been removed.

### Search Widget

#### All Platforms

* `Escape` - Hide search widget.

#### macOS

* `Cmd + F` - Show search widget.
* `Cmd + Alt + C` - Toggle match case.
* `Cmd + Alt + R` - Toggle use regular expression.
* `Cmd + Alt + F` - Toggle show files.
* `Cmd + Alt + D` - Toggle show directories.
* `Cmd + Alt + L` - Toggle show symbolic links.
* `Cmd + Alt + X` - Toggle show conflicts.
* `Cmd + Alt + O` - Toggle show errors andf others.

#### Windows / Linux

* `Ctrl + F` - Show search widget.
* `Alt + C` - Toggle match case.
* `Alt + R` - Toggle use regular expression.
* `Alt + F` - Toggle show files.
* `Alt + D` - Toggle show directories.
* `Alt + L` - Toggle show symbolic links.
* `Alt + X` - Toggle show conflicts.
* `Alt + O` - Toggle show errors and others.

### Favorites

* `Click` - Start the favorite diff immediately in the current active panel. If `l13Diff.openInNewDiffPanel` is true the comparison opens in a new diff panel.

#### Favorites Context Icons

* `New Diff Panel` - Open a new panel.
* `New Group` - Add a new group.
* `Collapse All` - Collapse all groups.

#### Favorites Context Menu

* `Compare` - Start the favorite diff immediately in the current active panel. Ignores `l13Diff.openInNewDiffPanel`.
* `Compare in New Panel` - Start the favorite diff immediately in a new diff panel. Ignores `l13Diff.openInNewDiffPanel`.
* `Reveal in Finder/Explorer` - Reveal the left or right file/folder in the finder/explorer. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Open in Integrated Terminal` - Open the left or right path in the integrated terminal. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Open Workspace` - Open the left or right path as a workspace. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Open as Workspace` - Open the two paths as a workspace. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Add Folders to Workspace` - Add the paths to the current workspace. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Add to Group` - Add a favorite diff to a group.
* `Copy Left Path` - Copy the left path of the favorite diff to the clipboard.
* `Copy Right Path` - Copy the right path of the favorite diff to the clipboard.
* `Remove from Group` - Remove a favorite diff from a group.
* `Rename` - Change the name of a favorite diff.
* `Delete` - Delete a favorite diff.

#### Favorite Groups Context Menu

* `Compare All` - Compare all favorite diffs of a group at once.
* `Compare All Side By Side` - Compare all favorite diffs of a group at once side by side.
* `Rename` - Change the name of a favorite group.
* `Delete` - Delete a favorite group. Optionally you can delete also all favorites in the group.

### History

* `Click` - Open the previous comparison and start a comparison immediately.

#### Context Icons

* `Diff Folders: Clear History` - Clear the history of recently used files, folders and previous comparisons.

#### Context Menu

* `Compare` - Start the previous comparison immediately in the current active panel. Ignores `l13Diff.openInNewDiffPanel`.
* `Compare in New Panel` [2] - Start the previous comparison immediately in a new diff panel. Ignores `l13Diff.openInNewDiffPanel`.
* `Reveal in Finder/Explorer` - Reveal the left or right file/folder in the finder/explorer. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Open in Integrated Terminal` [2] - Open the left or right path in the integrated terminal. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Open Workspace` [2] - Open the left or right path as a workspace. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Open as Workspace` [2] - Open the two paths as a workspace. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Add Folders to Workspace` [2] - Add the paths to the current workspace. Requires version 0.20.0 of [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects).
* `Add to Favorites` - Add a previous comparison to favorites.
* `Copy Left Path` - Copy the left path of the previous comparison to the clipboard.
* `Copy Right Path` - Copy the right path of the previous comparison to the clipboard.
* `Delete` - Delete the previous comparison from the history.

[2] Only available for previous folder comparisons.

### Statusbar

* `Click` - Open the output channel for logging and stats.

### Navigator

* `Click` - Drag'n drop the scrollbar thumb of the navigator to scroll the list or click elsewhere in the navigator and jump to this part of the list.

### Visual Studio Code Explorer

#### Context Menu

* `Select for Compare` - Select a folder for a comparison.
* `Compare with Selected` - Compare the folder with the selected one.
* `Compare Selected` - Compare the two selected folders.

### [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)

#### Context Menu

* `Select for Compare` - Select a folder, repository or project for a comparison.
* `Compare with Selected` - Compare the folder, repository or project with the selected one.
* `Compare with Workspace` - Compare the folder, repository or project with the current workspace.
* `Open in Diff Folders` - Open the folder, repository or project in Diff Folders.

## Custom Keybindings

Custom keyboard shortcuts can be assigned to the commands. But not every command works properly because the right context is required. If a command has no default keyboard shortcut it is maybe necessary to add a when clause. The following list of context values are available in different view states.

* `l13DiffFocus` - The value is true if a diff panel has focus.
* `l13DiffListFocus` - The value is true if the list view has focus.
* `l13DiffInputFocus` - The value is true if the left or right input has focus.
* `l13DiffSearchFocus` - The value is true if the search input has focus.

## Workspace Trust

The extension is written with security in mind. Paths will be sanitized before they are used and if the file `.vscode/settings.json` is available in a workspace the content will be parsed with the native JSON parser to get the values of `l13Diff.exclude`.

Right now it is not possible to show a message if files will be copied from an untrusted workspace to a trusted one because there is no API to figure out if a workspace, which is not the current one, is trusted or not. Please always be careful when copying files and folders.

## Recommended Settings

The fastest and most accurate way to compare files is

```json
{
	"l13Diff.ignoreEndOfLine": false,
	"l13Diff.ignoreTrimWhitespace": "default",
	"diffEditor.ignoreTrimWhitespace": false,
	"l13Diff.ignoreByteOrderMark": false
}
```


## Recommended Extensions

* [Projects](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-projects)
* [Extension Pack](https://marketplace.visualstudio.com/items?itemName=L13RARY.l13-extension-pack)