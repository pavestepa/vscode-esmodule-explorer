import { FileNode } from "../FileNode";
import { Action } from "./base/Action";

export class ActionCommandContext {
    constructor(public readonly clickedItem: FileNode | undefined, public readonly selectedItems: readonly FileNode[] | undefined, public readonly args: any) {
    }
}

export abstract class ActionsCommand {
    constructor(protected title: string) {
    }

    public abstract getActionsBase(ctx: ActionCommandContext):
        Promise<Action[]>;
}

type ContextActionGettersOptions =
    [context: string, action: (item: FileNode) => Action[]] |
    [context: string, type: 'standard' | 'cps' | 'fs', action: (item: FileNode) => Action[]];

type ContextActionGetters = { [allowedContext: string]: (item: FileNode) => Action[] };

export function prepareContextActionGetters(options: ContextActionGettersOptions[]): ContextActionGetters {

    return Object.assign({}, ...options.flatMap(function (option) {

        const [context, type, actionsGetter] = option.length === 3 ? option : [option[0], undefined, option[1]];

        const allowedContexts = type ? [context + '-' + type] : [context, context + '-standard', context + '-cps'];

        return allowedContexts.map(allowedContext => ({ [allowedContext]: actionsGetter }));
    }));
}