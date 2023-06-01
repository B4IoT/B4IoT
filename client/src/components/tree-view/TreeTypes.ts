export interface TreeViewItem {
    children: TreeViewItem[]
    feature: string
    checkedStatus: CheckedState,
    collapsed: boolean,
    fixed:boolean
    name: string,
    data?: any,
    id: string,
    dependencies: {name:string,list:TreeViewItem[]}[],
    validation_info?: ValidationInfo
}

export interface ValidationInfo {
    info:string,
    type : "missing-dependency" | "conflict" | "multi"
}

export type CheckedState = 'true' | 'false'  | 'some';

export{}