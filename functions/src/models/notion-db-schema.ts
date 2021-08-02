export interface NotionDbSchema {
    
    id:string;
    title: string;
    properties: NotionDbProperty[];
}
export interface NotionDbProperty {

    id:string;
    name: string;
    type: string;
    options: Array<{ id: string, name: string }>
}