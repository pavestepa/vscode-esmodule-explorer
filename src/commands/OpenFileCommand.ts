import * as fs from "fs";
import { FileNode } from "../FileNode";
import { Action } from "../actions/base/Action";
import { OpenFile } from "../actions/OpenFile";
import { SingleItemActionsCommand } from "../actions/SingleItemActionsCommand";

export class OpenFileCommand extends SingleItemActionsCommand {
    private lastOpenedFile: string | undefined;
    private lastOpenedDate: Date | undefined;

    constructor() {
        super('Open file');
    }

    public shouldRun(item: FileNode | undefined): boolean {
        return !!item && !!item.path;
    }

    public async getActions(item: FileNode | undefined): Promise<Action[]> {
        if (!item || !item.path) { return []; }
        if (!(await fs.existsSync(item.path))) {
            return [];
        }

        const preview = !this.checkDoubleClick(item);
        return [ new OpenFile(item.path, preview) ];
    }

    private checkDoubleClick(item: FileNode): boolean {
        let result = false;
        if (this.lastOpenedFile && this.lastOpenedDate) {
            let isTheSameFile = this.lastOpenedFile === item.path;
            let dateDiff = <number>(<any>new Date() - <any>this.lastOpenedDate);
            result =  isTheSameFile && dateDiff < 500;
        }

        this.lastOpenedFile = item.path;
        this.lastOpenedDate = new Date();
        return result;
    }
}

