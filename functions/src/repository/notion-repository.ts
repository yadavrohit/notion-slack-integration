import { Configuration } from "../config";
import { NotionDbSchema } from "../models/notion-db-schema";
import { NotionDbSearchResult } from "../models/notion-db-search-results";
const { Client } = require('@notionhq/client');

export class NotionRepository {

    private notion: any;
    constructor() {
        this.notion = new Client({
            auth: Configuration.NOTION_TOKEN,
        });
    }
    public async getDatabaseByName(databaseTitle: string): Promise<any> {

        const allDbs = await this.notion.databases.list();
        return allDbs.results.filter((a: any) => a.title[0].plain_text === databaseTitle)[0];
    }
    public async getDatabase(databaseId: string): Promise<any> {

        const allDbs = await this.notion.databases.list();
        return allDbs.results.filter((a: any) => a.id === databaseId)[0];
    }
    public async searchDatabase(databaseId: string, searchKwd: string): Promise<NotionDbSearchResult[]> {

        const allDbs = await this.notion.databases.list();
        return allDbs.results.filter((a: any) => a.id === databaseId)[0];
    }
    public async addDatabaseRecord(databaseId: string, record: { [key: string]: String | String[] }) {

        const propertyValues: { [key: string]: any } = {};
        const dbObject = await this.getDatabase(databaseId);
        Object.keys(dbObject.properties).map((propName: string) => {

            const notionProp = dbObject.properties[propName];
            const propValue = record[propName];
            if (notionProp && propValue) {

                propertyValues[propName] = {
                    id: notionProp.id,
                    type: notionProp.type,
                    name: notionProp.name,
                };
                const newItem = propertyValues[propName];
                if (notionProp.type === 'title') {

                    newItem[notionProp.type] = [{ type: "text", text: { content: propValue as string } }]
                }
                else if (notionProp.type === 'date') {

                    newItem[notionProp.type] = { start: propValue as string };
                }
                else if (notionProp.type === 'rich_text') {

                    newItem[notionProp.type] = [{ type: "text", text: { content: propValue as string } }]
                }
                else if (notionProp.type === 'multi_select' || notionProp.type === 'select') {

                    newItem[notionProp.type] = notionProp[notionProp.type]?.options.filter((a: any) => (propValue as string[]).indexOf(a.name) >= 0)
                }
            }
        });
        const response = await this.notion.pages.create({
            parent: {
                database_id: databaseId,
            },
            properties: propertyValues,
        })
        console.log(JSON.stringify(record));
        console.log(JSON.stringify(propertyValues));
        return response;
    };
    public async getDatabaseSchema(db: { databaseTitle?: string, databaseId?: string }): Promise<NotionDbSchema> {

        const dbObject = db.databaseId ? await this.getDatabase(db.databaseId) : await this.getDatabaseByName(db.databaseTitle as string);
        return {

            id: dbObject.id,
            title: dbObject.title[0].plain_text,
            properties: Object.keys(dbObject.properties).map((propName: string) => {


                const notionProp = dbObject.properties[propName];
                return {

                    id: notionProp.id,
                    name: notionProp.name,
                    type: notionProp.type,
                    options: notionProp[notionProp.type]?.options,
                }
            }),
        };
    }
}