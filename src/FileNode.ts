import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class FileNode extends vscode.TreeItem {
    constructor(
        public readonly resourceUri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(resourceUri, collapsibleState);
        this.label = path.basename(resourceUri.fsPath);

        // Устанавливаем иконку в зависимости от типа элемента
        this.iconPath = this.getIconPath(resourceUri);
        this.contextValue = this.getContextValue(resourceUri);
    }

    public tooltip = `${this.label}`;

    public description = '';

    // Определяем иконку на основе типа элемента (папка или файл)
    private getIconPath(uri: vscode.Uri): vscode.ThemeIcon {

        if (fs.lstatSync(uri.fsPath).isDirectory()) {
            return new vscode.ThemeIcon('folder', new vscode.ThemeColor('terminal.ansiBrightBlue' ?? ''));
        } else {
            return new vscode.ThemeIcon('file', new vscode.ThemeColor('terminal.ansiBrightBlue' ?? ''));
        }
    }

    // Определяем значение контекста для контекстного меню
    private getContextValue(uri: vscode.Uri): string {
        if (fs.lstatSync(uri.fsPath).isDirectory()) {
            return 'folder';
        } else {
            return 'file';
        }
    }
}

//iconPath = new vscode.ThemeIcon('folder', new vscode.ThemeColor('terminal.ansiBrightBlue' ?? ''))
