/* eslint-disable */
export default {
	"l13-diff-actions/l13-diff-actions.css": ":host{cursor:default;display:block;text-align:center;user-select:none}:host>button{background:rgba(0,0,0,0);border:0;border-radius:5px;height:26px;margin:0 2px 0 2px;padding:0 0 0 0;position:relative;width:26px}:host>button::before{background:var(--l13-icon-background);content:\"\";height:100%;left:0;-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;position:absolute;top:0;width:100%}:host>button:focus{outline:solid 1px var(--vscode-focusBorder, transparent)}:host>button:not([disabled]):hover{cursor:pointer;outline:var(--l13-list-hover-outline, none);background-color:var(--l13-button-hover-background)}:host>button:not([disabled]).-active{background-color:var(--l13-button-active-background)}:host>button[disabled]{cursor:default;opacity:.3}:host>button#l13_copy_left{width:46px}:host>button#l13_copy_left::before{-webkit-mask-image:url(\"copy-left.svg\");mask-image:url(\"copy-left.svg\")}:host>button#l13_select_deleted::before{-webkit-mask-image:url(\"select-deleted.svg\");mask-image:url(\"select-deleted.svg\")}:host>button#l13_select_modified::before{-webkit-mask-image:url(\"select-modified.svg\");mask-image:url(\"select-modified.svg\")}:host>button#l13_select_untracked::before{-webkit-mask-image:url(\"select-untracked.svg\");mask-image:url(\"select-untracked.svg\")}:host>button#l13_select_all::before{-webkit-mask-image:url(\"select-all.svg\");mask-image:url(\"select-all.svg\")}:host>button#l13_copy_right{width:46px}:host>button#l13_copy_right::before{-webkit-mask-image:url(\"copy-right.svg\");mask-image:url(\"copy-right.svg\")}",
	"l13-diff-compare/l13-diff-compare.css": ":host{display:block;padding:3px 10px 0 0;text-align:right;user-select:none}button{background:var(--vscode-button-background);border:none;box-sizing:border-box;color:var(--vscode-button-foreground);cursor:pointer;font-size:.8125rem;outline:var(--l13-button-outline, none);padding:2px 14px 3px 14px;position:relative;z-index:1}button:hover{background:var(--vscode-button-hoverBackground)}button:focus{outline:solid 1px var(--vscode-focusBorder, transparent);outline-offset:1px}button[disabled]{opacity:.3;cursor:default}button[disabled]:hover{background:var(--vscode-button-background) !important}",
	"l13-diff-context/l13-diff-context.css": ":host{box-sizing:border-box;line-height:1px;padding:1px 0 0 0;vertical-align:sub;white-space:nowrap}:host button{background:rgba(0,0,0,0);border:none;border-radius:5px;cursor:pointer;display:inline-block;height:22px;margin:-3px 0 0 0;position:relative;width:22px;z-index:1}:host button:not([disabled]):hover{background-color:var(--l13-button-hover-background)}:host button:not([disabled]).-active{background-color:var(--l13-button-active-background)}:host button:not([disabled]).-active::before{background-color:var(--l13-icon-activeBackground)}:host button:disabled{cursor:default;opacity:.3}:host button:focus{outline:solid 1px var(--vscode-focusBorder, transparent)}:host button::before{background-color:var(--l13-icon-background);content:\"\";display:block;height:100%;left:0;-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;position:absolute;top:0;transition:background-color .1s;width:100%}:host button#copy::before{-webkit-mask-image:url(\"copy-file.svg\");mask-image:url(\"copy-file.svg\")}:host button#goto::before{-webkit-mask-image:url(\"open-file.svg\");mask-image:url(\"open-file.svg\")}:host button#delete::before{-webkit-mask-image:url(\"delete-file.svg\");mask-image:url(\"delete-file.svg\")}:host button#reveal::before{-webkit-mask-image:url(\"reveal-file.svg\");mask-image:url(\"reveal-file.svg\")}",
	"l13-diff-input/l13-diff-input.css": ":host{position:relative;user-select:none}:host>input{background:var(--vscode-input-background);border:none;box-sizing:border-box;color:var(--vscode-input-foreground);display:block;font-size:.8125rem;outline:solid 1px var(--vscode-input-border, transparent);outline-offset:-1px;padding:4px 35px 5px 7px;width:100%;z-index:0}:host>input::selection{background:var(--vscode-selection-background, var(--l13-selection-background))}:host>input:focus{outline-color:var(--vscode-focusBorder, transparent)}:host>input.-error{outline-color:var(--vscode-inputValidation-errorBorder, #cc0000)}:host>button{background:rgba(0,0,0,0);border:0;border-radius:5px;cursor:pointer;height:22px;padding:0 0 0 0;position:absolute;right:4px;top:1px;width:22px}:host>button::before{background:var(--l13-icon-background);content:\"\";height:100%;left:0;-webkit-mask-image:url(\"folder.svg\");mask-image:url(\"folder.svg\");-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;position:absolute;top:0;width:100%}:host>button:focus{outline:solid 1px var(--vscode-focusBorder, transparent)}:host>button:not([disabled]):hover{background-color:var(--l13-button-hover-background)}:host>button:not([disabled]).-active{background-color:var(--l13-button-active-background)}:host>button[disabled]{cursor:default;opacity:.3}:host>button[disabled]:hover::before{background:var(--l13-icon-background) !important}",
	"l13-diff-intro/l13-diff-intro.css": ":host{background:var(--l13-intro-backgroundUrl) no-repeat;background-size:260px 260px;background-position:50% 0;padding:270px 0 0 0;display:block;min-width:260px;text-align:center;user-select:none}l13-diff-shortcuts{display:inline-table}dl{color:var(--l13-intro-color);cursor:default;display:table-row;opacity:.8}dt{color:var(--l13-intro-color);display:table-cell;letter-spacing:.04em;padding:0 5px 1em 0;text-align:right}dd{display:table-cell;padding:0 0 1em 5px;text-align:left}div.-keybinding{align-items:center;display:flex;line-height:10px}span.-key{background-color:var(--l13-intro-keyBackgroundColor);border:1px solid var(--l13-intro-keyBorderColor);border-bottom-color:var(--l13-intro-shadow);border-radius:3px;box-shadow:inset 0 -1px 0 var(--l13-intro-shadow);color:var(--l13-intro-keyColor);display:inline-block;font-size:11px;line-height:10px;margin:0 2px;padding:3px 5px;vertical-align:middle}",
	"l13-diff-list/l13-diff-list.css": ":host{display:block;overflow:auto;transform:translate3d(0, 0, 0);user-select:none}l13-diff-list-content{display:block;transform:translate3d(0, 0, 0);width:100%}l13-diff-list-content.-focus l13-diff-list-row.-selected{background:var(--vscode-list-activeSelectionBackground);color:var(--vscode-list-activeSelectionForeground)}l13-diff-list-content.-focus l13-diff-list-row.-selected.-ignored l13-diff-list-file span.-missing{color:var(--vscode-list-activeSelectionForeground)}l13-diff-list-content.-focus l13-diff-list-row.-selected l13-diff-list-file::before{background:var(--vscode-list-activeSelectionForeground, var(--l13-icon-background))}l13-diff-list-content.-focus l13-diff-list-row.-selected l13-diff-list-file span.-exists{color:var(--vscode-list-activeSelectionForeground)}l13-diff-list-content.-drag-n-drop-file l13-diff-list-file.-folder,l13-diff-list-content.-drag-n-drop-file l13-diff-list-file.-symlink{opacity:.3}l13-diff-list-content.-drag-n-drop-folder l13-diff-list-file.-file,l13-diff-list-content.-drag-n-drop-folder l13-diff-list-file.-symlink{opacity:.3}l13-diff-list-content.-drag-n-drop-symlink l13-diff-list-file.-file,l13-diff-list-content.-drag-n-drop-symlink l13-diff-list-file.-folder{opacity:.3}l13-diff-list-row{display:flex;height:22px;position:absolute;left:0;top:0;outline-offset:-1px;width:100%}l13-diff-list-row:hover{background:var(--vscode-list-hoverBackground);color:var(--vscode-list-hoverForeground);outline:var(--l13-list-hover-outline, none)}l13-diff-list-row.-selected{background:var(--vscode-list-inactiveSelectionBackground);color:var(--vscode-list-inactiveSelectionForeground);outline:var(--l13-list-active-outline, none)}l13-diff-list-row.-selected l13-diff-list-file ::before{background:var(--l13-icon-background)}l13-diff-list-row.-deleted{color:var(--vscode-gitDecoration-deletedResourceForeground)}l13-diff-list-row.-modified{color:var(--vscode-gitDecoration-modifiedResourceForeground)}l13-diff-list-row.-unchanged{color:var(--vscode-foreground)}l13-diff-list-row.-unchanged l13-diff-list-file.-folder span.-exists{padding-right:0}l13-diff-list-row.-ignored l13-diff-list-file::before{opacity:.3}l13-diff-list-row.-ignored l13-diff-list-file.-deleted span.-missing{color:var(--vscode-gitDecoration-deletedResourceForeground)}l13-diff-list-row.-ignored l13-diff-list-file.-untracked span.-missing{color:var(--vscode-gitDecoration-untrackedResourceForeground)}l13-diff-list-row.-ignored l13-diff-list-file span.-basename{color:var(--vscode-gitDecoration-ignoredResourceForeground);opacity:.5}l13-diff-list-row.-ignored l13-diff-list-file.-folder span.-missing{padding-right:5px}l13-diff-list-row.-conflicting{color:var(--vscode-gitDecoration-conflictingResourceForeground)}l13-diff-list-row.-untracked{color:var(--vscode-gitDecoration-untrackedResourceForeground)}l13-diff-list-row.-error{background:var(--vscode-list-errorForeground);color:#fff}l13-diff-list-row.-error l13-diff-list-file::before{background:#fff}l13-diff-list-file{box-sizing:border-box;display:flex;justify-content:space-between;overflow:hidden;padding:2px 3px 4px 36px;position:relative;width:calc(50% - 22px)}l13-diff-list-file:first-child{padding-left:31px;padding-right:10px;width:calc(50% + 22px)}l13-diff-list-file:first-child.-error::before,l13-diff-list-file:first-child.-file::before,l13-diff-list-file:first-child.-folder::before,l13-diff-list-file:first-child.-symlink::before,l13-diff-list-file:first-child.-unknown::before{left:10px}l13-diff-list-file.-draghover{background:var(--vscode-list-focusBackground);color:var(--vscode-list-focusForeground)}l13-diff-list-file.-error::before,l13-diff-list-file.-file::before,l13-diff-list-file.-folder::before,l13-diff-list-file.-symlink::before,l13-diff-list-file.-unknown::before{background:var(--l13-icon-background);content:\"\";display:block;height:16px;left:15px;-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;position:absolute;top:2px;width:16px}l13-diff-list-file.-error::before{-webkit-mask-image:url(\"list-error.svg\");mask-image:url(\"list-error.svg\")}l13-diff-list-file.-file::before{-webkit-mask-image:url(\"list-file.svg\");mask-image:url(\"list-file.svg\")}l13-diff-list-file.-folder::before{-webkit-mask-image:url(\"list-folder.svg\");mask-image:url(\"list-folder.svg\")}l13-diff-list-file.-folder span.-basename{opacity:.7}l13-diff-list-file.-folder span.-missing{padding-right:0}l13-diff-list-file.-symlink::before{-webkit-mask-image:url(\"list-symlink.svg\");mask-image:url(\"list-symlink.svg\")}l13-diff-list-file.-unknown::before{-webkit-mask-image:url(\"list-unknown.svg\");mask-image:url(\"list-unknown.svg\")}l13-diff-list-file div.-path{overflow:hidden;text-overflow:ellipsis;white-space:pre}l13-diff-list-file span.-exists{color:var(--vscode-foreground);opacity:.7;padding-right:5px}l13-diff-list-file span.-missing{opacity:.7;padding-right:5px}l13-diff-list-file span.-info{color:var(--vscode-foreground);font-size:11px;opacity:.5;padding-left:5px}",
	"l13-diff-menu/l13-diff-menu.css": ":host{background:var(--vscode-editorWidget-background);box-shadow:0px 5px 8px var(--vscode-widget-shadow, transparent);box-sizing:border-box;display:block}:host>l13-diff-menu-lists>ul{border-top:solid 1px var(--vscode-pickerGroup-border);list-style-type:none;margin:0 0 0 0;padding:0 0 0 0}:host>l13-diff-menu-lists>ul:first-child{border:none}:host>l13-diff-menu-lists>ul>li{color:var(--vscode-foreground);cursor:pointer;display:flex;justify-content:space-between;margin:0 0 0 0;padding:4px 10px 5px 10px;user-select:none}:host>l13-diff-menu-lists>ul>li.-active,:host>l13-diff-menu-lists>ul>li.-selected{background:var(--vscode-list-focusBackground);color:var(--vscode-list-focusForeground)}:host>l13-diff-menu-lists>ul>li:hover{background:var(--vscode-list-hoverBackground);color:var(--vscode-list-hoverForeground)}:host>l13-diff-menu-lists>ul>li div.-path{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}:host>l13-diff-menu-lists>ul>li div.-info{color:var(--vscode-pickerGroup-foreground);padding-left:10px;text-align:right;white-space:nowrap}",
	"l13-diff-navigator/l13-diff-navigator.css": ":host{display:block;position:relative;transform:translate3d(0, 0, 0);user-select:none}div{background-color:var(--vscode-scrollbarSlider-background);box-sizing:border-box;height:10;position:absolute;right:0;top:0;transform:translate3d(0, 0, 0);width:30px;z-index:1}div:hover{background-color:var(--vscode-scrollbarSlider-hoverBackground)}div:active{background-color:var(--vscode-scrollbarSlider-activeBackground)}#ruler{display:block;position:absolute;right:30px;top:0;z-index:0}#map{display:block;opacity:.7;position:absolute;right:0;top:0;z-index:0}",
	"l13-diff-panel/l13-diff-panel.css": ":host{background:var(--vscode-sideBar-background);color:var(--vscode-foreground);display:block;position:relative;width:100%}l13-diff-loading{bottom:0;display:block;height:2px;left:0;overflow:hidden;position:absolute;right:0;width:100%;z-index:4}l13-diff-loading::after{animation:loading 4s linear infinite;background:linear-gradient(90deg, transparent 0%, var(--vscode-progressBar-background) 20%, var(--vscode-progressBar-background) 80%, transparent 100%) no-repeat;bottom:0;content:\"\";height:2px;position:absolute;left:0;width:5%}@keyframes loading{0%{left:0;width:3%}50%{width:8%}100%{left:100%;width:3%}}",
	"l13-diff-search/l13-diff-search.css": ":host{background:var(--vscode-editorWidget-background);box-shadow:0 2px 8px var(--vscode-widget-shadow);box-sizing:border-box;display:block;height:34px;max-width:calc(100% - 38px);min-width:364px;padding:4px 4px 5px 8px;position:relative;user-select:none;width:364px}#l13_resizer{background:var(--vscode-editorWidget-resizeBorder, var(--l13-searchWidget-borderColor));cursor:col-resize;display:block;height:100%;left:0;position:absolute;top:0;width:3px}div.l13-input{margin:0 154px 0 0;position:relative}div.l13-message{background:var(--vscode-inputValidation-errorBackground);box-sizing:border-box;border:solid 1px var(--vscode-inputValidation-errorBorder);color:var(--vscode-inputValidation-errorForeground);font-size:12px;line-height:17px;margin:-1px 0 0 0;padding:.4em .4em .4em .4em;width:100%}input[type=text]{background:var(--vscode-input-background);border:none;box-sizing:border-box;color:var(--vscode-input-foreground);display:block;font-size:.8125rem;height:25px;outline:solid 1px var(--vscode-input-border, transparent);outline-offset:-1px;margin:0 0 0 0;padding:4px 46px 5px 7px;width:100%;z-index:0}input[type=text]::selection{background:var(--vscode-selection-background, var(--l13-selection-background))}input[type=text]:focus{outline-color:var(--vscode-focusBorder, transparent)}input[type=text].-error{outline-color:var(--vscode-inputValidation-errorBorder)}input[type=checkbox]{-webkit-appearance:none;appearance:none;border-radius:3px;box-sizing:border-box;cursor:pointer;display:inline-block;height:20px;margin:0 0 0 0;opacity:.7;outline:solid 1px rgba(0,0,0,0);outline-offset:-1px;padding:0 0 0 0;position:absolute;top:3px;width:20px}input[type=checkbox]:hover{opacity:1}input[type=checkbox]:focus{outline-color:var(--vscode-focusBorder, transparent);opacity:1}input[type=checkbox]::after{background:var(--l13-icon-background);content:\"\";height:100%;left:0;-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;opacity:.7;position:absolute;top:0;width:100%}input[type=checkbox]#l13_case_sensitive{right:27px}input[type=checkbox]#l13_case_sensitive:hover{outline:var(--l13-list-hover-outline, none)}input[type=checkbox]#l13_case_sensitive::after{-webkit-mask-image:url(\"case-sensitive.svg\");mask-image:url(\"case-sensitive.svg\")}input[type=checkbox]#l13_use_regexp{right:5px}input[type=checkbox]#l13_use_regexp:hover{outline:var(--l13-list-hover-outline, none)}input[type=checkbox]#l13_use_regexp::after{-webkit-mask-image:url(\"regexp.svg\");mask-image:url(\"regexp.svg\")}input[type=checkbox].-option{height:22px;top:6px;width:22px}input[type=checkbox]#l13_use_files{right:132px}input[type=checkbox]#l13_use_files::after{-webkit-mask-image:url(\"list-file.svg\");mask-image:url(\"list-file.svg\");left:1px}input[type=checkbox]#l13_use_folders{right:106px}input[type=checkbox]#l13_use_folders::after{-webkit-mask-image:url(\"list-folder.svg\");mask-image:url(\"list-folder.svg\")}input[type=checkbox]#l13_use_symlinks{right:80px}input[type=checkbox]#l13_use_symlinks::after{-webkit-mask-image:url(\"list-symlink.svg\");mask-image:url(\"list-symlink.svg\")}input[type=checkbox]#l13_use_conflicts{right:54px}input[type=checkbox]#l13_use_conflicts::after{-webkit-mask-image:url(\"search-conflict.svg\");mask-image:url(\"search-conflict.svg\")}input[type=checkbox]#l13_use_others{right:28px}input[type=checkbox]#l13_use_others::after{-webkit-mask-image:url(\"search-other.svg\");mask-image:url(\"search-other.svg\")}input[type=checkbox]:checked{background:var(--vscode-inputOption-activeBackground, transparent);outline-color:var(--vscode-inputOption-activeBorder)}input[type=checkbox]:checked::after{opacity:1}button{background:rgba(0,0,0,0);border:0;height:20px;margin:0 0 0 0;padding:0 0 0 0;position:absolute;right:4px;top:7px;width:20px}button::before{background:var(--l13-icon-background);content:\"\";height:100%;left:0;-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;position:absolute;top:0;width:100%}button:focus{outline:solid 1px var(--vscode-focusBorder, transparent)}button:hover{background:var(--l13-searchButton-backgroundColor-hover);cursor:pointer}button[disabled]{opacity:.3;cursor:default}button[disabled]:hover::before{background:var(--l13-icon-background) !important}button#l13_close:hover{outline:var(--l13-list-hover-outline, none)}button#l13_close::before{-webkit-mask-image:url(\"close.svg\");mask-image:url(\"close.svg\")}",
	"l13-diff-swap/l13-diff-swap.css": ":host{display:block;user-select:none}:host>button{background:rgba(0,0,0,0);border:0;border-radius:5px;cursor:pointer;height:22px;margin:2px 0 0 0;padding:0 0 0 0;position:relative;width:22px}:host>button::before{background:var(--l13-icon-background);content:\"\";height:100%;left:0;-webkit-mask-image:url(\"swap.svg\");mask-image:url(\"swap.svg\");-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;position:absolute;top:0;width:100%}:host>button:focus{outline:solid 1px var(--vscode-focusBorder, transparent)}:host>button:not([disabled]):hover{background-color:var(--l13-button-hover-background);outline:var(--l13-list-hover-outline, none)}:host>button:not([disabled]).-active{background-color:var(--l13-button-active-background)}:host>button[disabled]{cursor:default;opacity:.3}:host>button[disabled]:hover::before{background:var(--l13-icon-background) !important}",
	"l13-diff-views/l13-diff-views.css": ":host{cursor:default;display:block;padding-left:10px;user-select:none}:host>input[type=checkbox]{-webkit-appearance:none;appearance:none;background:rgba(0,0,0,0);border-radius:5px;cursor:pointer;height:26px;margin:0 4px 0 0;padding:0 0 0 0;position:relative;width:26px}:host>input[type=checkbox]::before{background:var(--l13-icon-background);content:\"\";height:100%;left:0;-webkit-mask-position:50% 50%;mask-position:50% 50%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;position:absolute;top:0;width:100%}:host>input[type=checkbox]:focus{outline:solid 1px var(--vscode-focusBorder, transparent)}:host>input[type=checkbox]:not([disabled]):hover{cursor:pointer;outline:var(--l13-list-hover-outline, none);background-color:var(--l13-button-hover-background)}:host>input[type=checkbox]:not([disabled]).-active{background-color:var(--l13-button-active-background)}:host>input[type=checkbox][disabled]{opacity:.3;cursor:default}:host>input[type=checkbox]:checked::after{background:var(--vscode-inputOption-activeBorder);content:\"\";height:2px;left:4px;position:absolute;bottom:0;width:18px}:host>input[type=checkbox]#l13_show_unchanged::before{-webkit-mask-image:url(\"show-unchanged.svg\");mask-image:url(\"show-unchanged.svg\")}:host>input[type=checkbox]#l13_show_deleted::before{-webkit-mask-image:url(\"show-deleted.svg\");mask-image:url(\"show-deleted.svg\")}:host>input[type=checkbox]#l13_show_modified::before{-webkit-mask-image:url(\"show-modified.svg\");mask-image:url(\"show-modified.svg\")}:host>input[type=checkbox]#l13_show_untracked::before{-webkit-mask-image:url(\"show-untracked.svg\");mask-image:url(\"show-untracked.svg\")}:host>input[type=checkbox]#l13_show_ignored::before{-webkit-mask-image:url(\"show-ignored.svg\");mask-image:url(\"show-ignored.svg\")}",
	"l13-diff/l13-diff.css": ":host{display:flex;font-size:.8125rem;flex-direction:column;height:100%;max-height:100%;min-width:610px;position:relative}l13-diff-panel{background:var(--vscode-sideBar-background);position:relative;z-index:2}l13-diff-folders{background:var(--vscode-sideBar-background);display:flex;position:relative;z-index:4}l13-diff-input{box-sizing:border-box;margin:10px 10px 0 15px;position:relative;width:50%;z-index:3}l13-diff-input:first-child{margin:10px 15px 0 10px}l13-diff-menu{max-height:50vh;overflow:auto;position:absolute;width:100%;z-index:5}l13-diff-swap{left:calc(50% - 11px);position:absolute;top:9px;z-index:3}l13-diff-tools{background:var(--vscode-sideBar-background);display:flex;padding:7px 0 4px 0;position:relative;z-index:3}l13-diff-views,l13-diff-compare{min-width:175px;width:25%}l13-diff-actions{min-width:240px;width:50%}l13-diff-widgets{display:block;position:relative;z-index:2}l13-diff-search{position:absolute;right:28px;top:0}l13-diff-search.-movein{animation:movein .1s linear}l13-diff-search.-moveout{animation:moveout .1s linear}@keyframes movein{0%{top:-42px}100%{top:0}}@keyframes moveout{0%{top:0}100%{top:-42px}}l13-diff-list{position:relative;margin:0 30px 0 0;z-index:1}l13-diff-list:focus{outline:solid 1px var(--vscode-focusBorder, transparent);outline-offset:-1px}l13-diff-list.-widgets{margin-top:34px}l13-diff-list.-active{pointer-events:none}l13-diff-list.-active::-webkit-scrollbar-thumb{background-color:var(--vscode-scrollbarSlider-activeBackground)}l13-diff-navigator{position:absolute;right:0;top:75px;width:44px;z-index:0}l13-diff-navigator.-widgets{margin-top:34px}l13-diff-intro{left:50%;position:absolute;top:50%;transform:translate(-50%, calc(-50% + 20px));user-select:none}l13-diff-no-result{display:block;left:50%;opacity:.7;position:absolute;top:50%;text-align:center;transform:translate(-50%, calc(-50% + 20px));user-select:none}::-webkit-scrollbar{height:14px;width:14px}::-webkit-scrollbar-thumb{background-color:var(--vscode-scrollbarSlider-background)}::-webkit-scrollbar-thumb:hover{background-color:var(--vscode-scrollbarSlider-hoverBackground)}::-webkit-scrollbar-thumb:active{background-color:var(--vscode-scrollbarSlider-activeBackground)}::-webkit-scrollbar-corner{background-color:rgba(0,0,0,0)}"
};