import * as vscode from 'vscode';
import { CustomExplorerProvider } from './CustomExplorer';
import { ExplorerCommands } from './ExplorerCommands';

export function activate(context: vscode.ExtensionContext) {
    const customExplorerProvider = new CustomExplorerProvider();
    const explorerCommands = new ExplorerCommands(customExplorerProvider);
    vscode.window.registerTreeDataProvider('sortedExplorer', customExplorerProvider);
    vscode.commands.registerCommand('sortedExplorer.refresh', () => customExplorerProvider.refresh());
    explorerCommands.register();

}

export function deactivate() {}
