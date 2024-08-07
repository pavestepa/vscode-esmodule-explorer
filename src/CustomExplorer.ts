import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FileNode } from './FileNode';

export class CustomExplorerProvider implements vscode.TreeDataProvider<FileNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileNode | undefined | void> = new vscode.EventEmitter<FileNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FileNode | undefined | void> = this._onDidChangeTreeData.event;

    private workspaceRoot: string | undefined = vscode.workspace.rootPath;
    private config: any;

    constructor() {
        this.loadConfig();
    }

    refresh(): void {
        this.loadConfig();
        this._onDidChangeTreeData.fire();
    }

    loadConfig(): void {
        if (this.workspaceRoot) {
            const configPath = path.join(this.workspaceRoot, 'sorting-config.json');
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                this.config = JSON.parse(configData)['sort'];
            } else {
                this.config = null;
            }
        }
    }

    getTreeItem(element: FileNode): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FileNode): Thenable<FileNode[]> {
        if (!this.workspaceRoot) {
            vscode.window.showInformationMessage('No workspace folder open');
            return Promise.resolve([]);
        }

        if (!element) {
            // Return root level folders and files
            return Promise.resolve(this.getFilesAndFolders(this.workspaceRoot, this.config));
        } else {
            // Return child level folders and files
            return Promise.resolve(this.getFilesAndFolders(element.resourceUri.fsPath, this.getSubConfig(element.resourceUri.fsPath)));
        }
    }

    private getFilesAndFolders(dirPath: string, config: any): FileNode[] {
        const items = fs.readdirSync(dirPath).map(name => path.join(dirPath, name));
        const folders = items.filter(item => fs.lstatSync(item).isDirectory());
        const files = items.filter(item => fs.lstatSync(item).isFile());
        const sortedFolders = this.sortItems(folders, config);
        const sortedFiles = this.sortItems(files, config ? config['default'] || [] : []);
        return [...sortedFolders, ...sortedFiles].map(item => 
            new FileNode(
                vscode.Uri.file(item),
                fs.lstatSync(item).isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
            )
        );
    }

    private sortItems(items: string[], order: any): string[] {
        return items.sort((a, b) => {
            const aName = path.basename(a);
            const bName = path.basename(b);
            const aIndex = this.getOrderIndex(aName, order);
            const bIndex = this.getOrderIndex(bName, order);

            if (aIndex !== -1 && bIndex !== -1) {
                return aIndex - bIndex;
            } else if (aIndex !== -1) {
                return -1;
            } else if (bIndex !== -1) {
                return 1;
            } else {
                return aName.localeCompare(bName);
            }
        });
    }

    private getOrderIndex(name: string, order: any): number {
        if (!order) return -1;
        for (let i = 0; i < order.length; i++) {
            if (typeof order[i] === 'string' && order[i] === name) {
                return i;
            } else if (typeof order[i] === 'object' && order[i][name] !== undefined) {
                return i;
            }
        }
        return -1;
    }

    private getSubConfig(dirPath: string): any {
        const relativePath = path.relative(this.workspaceRoot!, dirPath).replace(/\\/g, '/');
        const parts = relativePath.split('/');
        let config = this.config;

        for (const part of parts) {
            let found = false;

            for (const item of config) {
                if (typeof item === 'object' && item[part] !== undefined) {
                    config = item[part];
                    found = true;
                    break;
                }
            }

            if (!found) {
                return null;
            }
        }

        return config;
    }
}