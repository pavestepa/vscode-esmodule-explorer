import * as vscode from 'vscode';
import { CustomExplorerProvider } from './CustomExplorer';

export function activate(context: vscode.ExtensionContext) {
    const customExplorerProvider = new CustomExplorerProvider();
    vscode.window.registerTreeDataProvider('vscodeESModuleExplorer', customExplorerProvider);
    vscode.commands.registerCommand('vscode-esmodule-explorer.refresh', () => customExplorerProvider.refresh());
}

export function deactivate() {}
