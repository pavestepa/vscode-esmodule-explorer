import { FileNode } from "../FileNode";
import { Action } from "./base/Action";
import { ActionCommandContext, ActionsCommand } from "./ActionsCommand";

export abstract class SingleItemActionsCommand extends ActionsCommand {
    constructor(title: string) {
        super(title);
    }

    public async getActionsBase(ctx: ActionCommandContext): Promise<Action[]> {
        const item = ctx.clickedItem ?? (ctx.selectedItems?.length === 1 ? ctx.selectedItems[0] : undefined);
        return this.shouldRun(item) ? this.getActions(item) : [];
    }

    public abstract shouldRun(item: FileNode | undefined): boolean;

    public abstract getActions(item: FileNode | undefined): Promise<Action[]>;
}


