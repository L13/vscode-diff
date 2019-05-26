// tslint:disable
export default {
	"l13-diff-actions/l13-diff-actions.html": "<button id=\"l13_copy_right\" (click)=\"copyRight()\" [disabled]=\"copyDisabled\"></button>\n<button id=\"l13_select_deleted\" (click)=\"selectDeleted()\" [disabled]=\"selectDisabled\"></button>\n<button id=\"l13_select_modified\" (click)=\"selectModified()\" [disabled]=\"selectDisabled\"></button>\n<button id=\"l13_select_untracked\" (click)=\"selectUntracked()\" [disabled]=\"selectDisabled\"></button>\n<button id=\"l13_copy_left\" (click)=\"copyLeft()\" [disabled]=\"copyDisabled\"></button>",
	"l13-diff-compare/l13-diff-compare.html": "<button [disabled]=\"disabled\">Compare</button>",
	"l13-diff-input/l13-diff-input.html": "<input type=\"text\" [(model)]=\"value\" [disabled]=\"disabled\">\n<button (click)=\"openDialog()\" [disabled]=\"disabled\"></button>\n<slot></slot>",
	"l13-diff-list-search/l13-diff-list-search.html": "",
	"l13-diff-list/l13-diff-list.html": "<l13-diff-list-body></l13-diff-list-body>",
	"l13-diff-menu/l13-diff-menu.html": "<l13-diff-menu-lists></l13-diff-menu-lists>",
	"l13-diff-panel/l13-diff-panel.html": "<l13-diff-loading [if]=\"loading\"></l13-diff-loading>\n<slot></slot>",
	"l13-diff-swap/l13-diff-swap.html": "<button [disabled]=\"disabled\"></button>",
	"l13-diff-views/l13-diff-views.html": "<input id=\"l13_show_unchanged\" type=\"checkbox\" [(model)]=\"unchangedChecked\" [disabled]=\"disabled\">\n<input id=\"l13_show_deleted\" type=\"checkbox\" [(model)]=\"deletedChecked\" [disabled]=\"disabled\">\n<input id=\"l13_show_modified\" type=\"checkbox\" [(model)]=\"modifiedChecked\" [disabled]=\"disabled\">\n<input id=\"l13_show_untracked\" type=\"checkbox\" [(model)]=\"untrackedChecked\" [disabled]=\"disabled\">",
	"l13-diff/l13-diff.html": "<l13-diff-panel vmId=\"panel\">\n\t<l13-diff-folders>\n\t\t<l13-diff-input vmId=\"left\" id=\"left\" placeholder=\"Left file or folder\"></l13-diff-input>\n\t\t<l13-diff-swap vmId=\"swap\"></l13-diff-swap>\n\t\t<l13-diff-input vmId=\"right\" id=\"right\" placeholder=\"Right file or folder\"></l13-diff-input>\n\t</l13-diff-folders>\n\t<l13-diff-tools>\n\t\t<l13-diff-views vmId=\"views\"></l13-diff-views>\n\t\t<l13-diff-actions vmId=\"actions\"></l13-diff-actions>\n\t\t<l13-diff-compare vmId=\"compare\"></l13-diff-compare>\n\t</l13-diff-tools>\n</l13-diff-panel>\n<l13-diff-list vmId=\"list\"></l13-diff-list>"
};