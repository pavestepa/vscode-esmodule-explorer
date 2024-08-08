import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { FileNode } from './FileNode';

export class CustomExplorerProvider implements vscode.TreeDataProvider<FileNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileNode | undefined | void> = new vscode.EventEmitter<FileNode | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<FileNode | undefined | void> = this._onDidChangeTreeData.event;

    private workspaceRoot: string | undefined = vscode.workspace.rootPath;
    private folderConfig: any;
    private globalConfig: any;

    constructor() {
        this.loadConfig();
    }

    public refresh(item?: FileNode): void {
		if (item) {
			this._onDidChangeTreeData.fire(item);
		} else {
			this._onDidChangeTreeData.fire();
		}
	}

    loadConfig(): void {
        if (this.workspaceRoot) {
            const configPath = path.join(this.workspaceRoot, 'sorting-config.json');
            const optionalConfigPath = path.join(this.workspaceRoot, '.vscode/sorting-config.json');
            if (fs.existsSync(configPath)) {
                const configData = fs.readFileSync(configPath, 'utf8');
                const config = JSON.parse(configData);
                this.folderConfig = config['sortFolders'];
                this.globalConfig = config['sortGlobal'];
            } else if (fs.existsSync(optionalConfigPath)) {
                const configData = fs.readFileSync(optionalConfigPath, 'utf8');
                const config = JSON.parse(configData);
                this.folderConfig = config['sortFolders'];
                this.globalConfig = config['sortGlobal'];
            } else {
                this.folderConfig = null;
                this.globalConfig = null;
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
            return Promise.resolve(this.getFilesAndFolders(this.workspaceRoot, this.folderConfig));
        } else {
            return Promise.resolve(this.getFilesAndFolders(element.resourceUri.fsPath, this.getSubConfig(element.resourceUri.fsPath)));
        }
    }

    private getFilesAndFolders(dirPath: string, config: any): FileNode[] {
        const randomItems = fs.readdirSync(dirPath).map(name => path.join(dirPath, name));
        const folders = randomItems.filter(randomItems => fs.lstatSync(randomItems).isDirectory());
        const files = randomItems.filter(randomItems => !fs.lstatSync(randomItems).isDirectory());
        const items = [...folders, ...files];

        const configItems = this.sortItems(items, config);
        const sortedItems = this.mergeUniqueArrays(configItems, items);
        return sortedItems.map(item =>
            new FileNode(
                vscode.Uri.file(item),
                fs.lstatSync(item).isDirectory() ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                item
            )
        );
    }

    private sortItems(items: string[], config: any): string[] {
        if (!config) return [];
    
        // Объединяем глобальный и папочный конфиги
        const combinedConfig = this.globalConfig ? [...this.globalConfig, ...(config || [])] : config;
        
        // Фильтрация элементов на основе конфигураций
        const filteredItems = items.filter(item => {
            const name = path.basename(item);
            return this.isInConfig(name, combinedConfig);
        });
    
        // Сортировка отфильтрованных элементов
        return filteredItems.sort((a, b) => {
            const aName = path.basename(a);
            const bName = path.basename(b);
            const aIndex = this.getOrderIndex(aName, combinedConfig);
            const bIndex = this.getOrderIndex(bName, combinedConfig);
    
            // Приоритет сортировки на основе конфигурации
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
        for (let i = 0; i < order.length; i++) {
            if (typeof order[i] === 'string' && order[i] === name) {
                return i;
            } else if (typeof order[i] === 'object') {
                for (const [key, value] of Object.entries(order[i])) {
                    if (key === name) {
                        return i;
                    }
                }
            }
        }
        return -1;
    }
    
    private isInConfig(name: string, config: any): boolean {
        // Проверка наличия элемента в конфигурации
        if (!config) return false;
    
        for (const item of config) {
            if (typeof item === 'string' && item === name) {
                return true;
            } else if (typeof item === 'object') {
                if (Object.keys(item).includes(name)) {
                    return true;
                }
            }
        }
        return false;
    }

    private mergeUniqueArrays(a: string[], b: string[]): string[] {
        // Создаем Set из элементов первого массива для более быстрой проверки наличия
        const aSet = new Set(a);
    
        // Фильтруем второй массив, удаляя элементы, которые есть в первом массиве
        const filteredB = b.filter(item => !aSet.has(item));
    
        // Объединяем оба массива
        return [...a, ...filteredB];
    }

    private getSubConfig(dirPath: string): any {
        const relativePath = path.relative(this.workspaceRoot!, dirPath).replace(/\\/g, '/');
        const parts = relativePath.split('/');
        let config = this.folderConfig;

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