export function findInReactTree(root: any, filter: (node: any) => boolean): any {
    return BdApi.Utils.findInTree(root, filter, {
        walkable: ["children", "props"]
    });
}
