import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class FileNode extends vscode.TreeItem {
    constructor(
        public readonly resourceUri: vscode.Uri,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        _path: string
    ) {
        super(resourceUri, collapsibleState);
        this.label = path.basename(resourceUri.fsPath);

        this.iconPath = this.getIconPath(resourceUri);
        this.contextValue = this.getContextValue(resourceUri);
        if (_path) {this.path = _path;}
    }
    private isMainFolderFile: boolean = false;
    public path?: string;
    public tooltip = `${this.label}`;
    public description = '';

    private getIconPath(uri: vscode.Uri): { light: string, dark: string } | vscode.ThemeIcon {
        const isFolder = fs.lstatSync(uri.fsPath).isDirectory();
        let icon = isFolder ? vscode.ThemeIcon.Folder : vscode.ThemeIcon.File;

        if (this.isMainFolderFile) {
            icon = new vscode.ThemeIcon('notebook-mimetype');
        }

        return icon;
    }

    private getContextValue(uri: vscode.Uri): string {
        return fs.lstatSync(uri.fsPath).isDirectory() ? 'folder' : 'file';
    }

}
//iconPath = new vscode.ThemeIcon('folder', new vscode.ThemeColor('terminal.ansiBrightBlue' ?? ''))
