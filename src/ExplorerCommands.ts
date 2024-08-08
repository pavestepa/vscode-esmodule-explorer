import * as vscode from "vscode";
import { CustomExplorerProvider } from "./CustomExplorer";

export class ExplorerCommands {
    constructor(private readonly provider: CustomExplorerProvider) {}

    public register() {
        vscode.commands.registerCommand('sortedExplorer.refresh', () => this.refresh());
        vscode.commands.registerCommand('sortedExplorer.renameFile', item => this.renameFile(item));
        vscode.commands.registerCommand('sortedExplorer.deleteFile', item => this.deleteFile(item));
        vscode.commands.registerCommand('sortedExplorer.createFile', item => this.createFile(item));
        vscode.commands.registerCommand('sortedExplorer.renameFolder', item => this.renameFolder(item));
        vscode.commands.registerCommand('sortedExplorer.deleteFolder', item => this.deleteFolder(item));
        vscode.commands.registerCommand('sortedExplorer.createFolder', item => this.createFolder(item));
        vscode.commands.registerCommand('sortedExplorer.openFile', item => this.openFile(item));
    }

    private refresh() {
        this.provider.refresh();
    }

    private async renameFile(item: any): Promise<void> {
        if (!item.rename) return;

        let value = await vscode.window.showInputBox({ placeHolder: item.label });
        if (value !== null && value !== undefined) {
            try {
                await item.rename(value);
                item.parent.refresh();
                this.refresh();
            } catch(ex) {
                vscode.window.showInformationMessage('Can not rename file: ' + ex);
            }
        }     
    }

    private async deleteFile(item: any): Promise<void> {
        if (!item.delete) return;

        try {
            await item.delete();
            item.parent.refresh();
            this.provider.refresh(item.parent);
        } catch(ex) {
            vscode.window.showInformationMessage('Can not delete file: ' + ex);
        }
    }
    
    private async createFile(item: any ): Promise<void> {
        if (!item.createFile) {
          if (item.parent && item.parent.createFile)
            item = item.parent;
          else
            return;
        }
        let value = await vscode.window.showInputBox({ placeHolder: 'New filename' });
        if (value !== null && value !== undefined) {
            try {
                let filepath = await item.createFile(value);
                item.refresh();
                this.provider.refresh(item);
                await this.openFile(filepath);
            } catch(ex) {
                vscode.window.showInformationMessage('Can not create file: ' + ex);
            }
        }
    }

    private async renameFolder(item: any) {
        if (!item.rename) return;

        let value = await vscode.window.showInputBox({ placeHolder: item.label });
        if (value !== null && value !== undefined) {
            try {
                await item.rename(value);
                item.parent.refresh();
                this.provider.refresh(item.parent);
            } catch(ex) {
                vscode.window.showInformationMessage('Can not rename folder: ' + ex);
            }
        }
    }

    private async deleteFolder(item: any): Promise<void> {
        if (!item.delete) return;
        try {
            await item.delete();
            item.parent.refresh();
            this.provider.refresh(item.parent);
        } catch(ex) {
            vscode.window.showInformationMessage('Can not delete folder: ' + ex);
        }
    }

    private async createFolder(item: any): Promise<void> {
        if (!item.createFolder) {
          if (item.parent && item.parent.createFolder)
            item = item.parent;
          else
            return;
        }

        let value = await vscode.window.showInputBox({ placeHolder: 'New folder name' })
        if (value !== null && value !== undefined) {
            try {
                await item.createFolder(value);
                item.refresh();
                this.provider.refresh(item);
            } catch(ex) {
                vscode.window.showInformationMessage('Can not create folder: ' + ex);
            }
        }
    }

    private async openFile(filepath: string): Promise<void> {
        let document = await vscode.workspace.openTextDocument(filepath);
        vscode.window.showTextDocument(document);    
    }
}