Config vscode, eslint

{
    "window.zoomLevel": -1,
    "workbench.colorTheme": "Dracula Pure",
    "workbench.iconTheme": "material-icon-theme",
    "[html]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescript]": {
        "editor.defaultFormatter": "vscode.typescript-language-features",
        "editor.formatOnSave": false
    },
    "[typescriptreact]": {
        "editor.defaultFormatter": "vscode.typescript-language-features",
        "editor.formatOnSave": false
    },
    "javascript.updateImportsOnFileMove.enabled": "always",
    "diffEditor.ignoreTrimWhitespace": false,
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": true
    },
    "typescript.updateImportsOnFileMove.enabled": "always"
}