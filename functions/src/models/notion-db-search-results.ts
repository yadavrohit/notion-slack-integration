export interface NotionDbSearchResult {

    databaseId: string;
    databaseTitle: string;
    record: { [key: string]: String | String[] };
}