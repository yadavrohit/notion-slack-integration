import { View, WebClient } from '@slack/web-api';
import { Configuration } from '../config';
import { NotionDbProperty, NotionDbSchema } from '../models/notion-db-schema';
import { NotionDbSearchResult } from '../models/notion-db-search-results';
//const fetch = require('node-fetch');

export class SlackRepository {

    private bot: WebClient;
    constructor() {
        this.bot = new WebClient(Configuration.SLACK_TOKEN);
    }
    //https://api.slack.com/dialogs
    public initialDialog(): View {
        return {
            type: "modal",
            title: {
                type: 'plain_text',
                text: "Loading",
                emoji: true,
            },
            close: {
                type: "plain_text",
                text: "Cancel",
                emoji: true,
            },
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Please wait while we load*",
                    },
                },
            ],
        };
    }
    public generateDialog(schema: NotionDbSchema): View {

        return {
            type: "modal",
            title: {
                type: 'plain_text',
                text: schema.title,
                emoji: true,
            },
            submit: {
                type: "plain_text",
                text: "Submit",
                emoji: true,
            },
            close: {
                type: "plain_text",
                text: "Cancel",
                emoji: true,
            },
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "*Please enter the following values:*",
                    },
                },
                {
                    type: "divider",
                },
            ].concat(schema.properties.map(a => this.mapNotionPropertyToSlackUIBlock(a))),
            private_metadata: schema.id,
        };
    };

    public async initCommand(commandName: string, message: any): Promise<string> {

        const view = await this.bot.views.open({
            trigger_id: message.trigger_id,
            view: this.initialDialog(),
        });
        return view.view?.id as string;
    }

    public async processFindCommand(message: any, results: NotionDbSearchResult[]) {

        // const slackForm = await this.generateDialog(notionSchema);
        // await this.bot.views.update({
        //     trigger_id: message.trigger_id,
        //     view: slackForm,
        //     view_id: message.view_id,
        // });

        // fetch(message.response_url, {
        //     method: "POST",
        //     headers: {
        //         "content-type": "application/json",
        //     },
        //     body: JSON.stringify({ ...slackForm, trigger_id: message.trigger_id }),
        // });
    }

    public async processNewCommand(message: any, notionSchema: NotionDbSchema) {

        const slackForm = await this.generateDialog(notionSchema);
        await this.bot.views.update({
            trigger_id: message.trigger_id,
            view: slackForm,
            view_id: message.view_id,
        });

        // fetch(message.response_url, {
        //     method: "POST",
        //     headers: {
        //         "content-type": "application/json",
        //     },
        //     body: JSON.stringify({ ...slackForm, trigger_id: message.trigger_id }),
        // });
    }


    public mapSlackUIBlockToValuePair(message: any): { [key: string]: String | String[] } {
        const record: { [key: string]: String | String[] } = {};
        const viewBlocks = message.view.blocks;
        const viewStateValues = message.view.state.values;
        viewBlocks.forEach((blockItem: any) => {

            const blockState = viewStateValues[blockItem.block_id];
            if (blockState) {
                const blockPropertyName = Object.keys(blockState)[0];
                const blockStateInternal = blockState[blockPropertyName];
                if (blockStateInternal.type === 'plain_text_input') {
                    record[blockPropertyName] = blockStateInternal.value;
                }
                else if (blockStateInternal.type === 'datepicker') {
                    record[blockPropertyName] = blockStateInternal.selected_date;
                }
                else if (blockStateInternal.type === 'static_select' || blockStateInternal.type === 'multi_static_select') {
                    record[blockPropertyName] = blockStateInternal.selected_options?.map((a: any) => a.text.text);
                }
            }
        });
        return record;
    }

    private mapNotionPropertyToSlackUIBlock(property: NotionDbProperty): any {

        if (property.type === "title" || property.type === "text" || property.type === "rich_text") {

            return {
                type: "input",
                element: {
                    type: "plain_text_input",
                    action_id: property.name,
                },
                label: {
                    type: "plain_text",
                    text: property.name,
                },
            }
        }
        else if (property.type === "date") {

            return {
                type: "input",
                element: {
                    type: "datepicker",
                    action_id: property.name,
                    placeholder: {
                        type: "plain_text",
                        text: "Select a date",
                    },
                },
                label: {
                    type: "plain_text",
                    text: property.name,
                },
            }
        }
        else if (property.type === "select" || property.type === "multi_select") {

            return {
                type: "input",
                label: {
                    type: "plain_text",
                    text: "Select " + property.name,
                },
                element: {
                    type: property.type === "multi_select" ? "multi_static_select" : "static_select",
                    action_id: property.name,
                    placeholder: {
                        type: "plain_text",
                        text: "Select " + property.name,
                    },
                    options: property.options.map((a: any) => {

                        return {
                            text: {
                                type: "plain_text",
                                text: a.name,
                                emoji: true,
                            },
                            value: a.id,
                        }
                    }),
                },
            }
        }
    }

}