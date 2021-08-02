import e = require("express");
import { NotionDbSchema } from "../models/notion-db-schema";
import { SlackCommandType } from "../models/slack-command.enum";
import { SlackRepository, NotionRepository, GooglePubSubRepository } from "../repository";

export class SlackService {

    private slackRepository: SlackRepository;
    private googlePubSubRepository: GooglePubSubRepository;
    private notionRepository: NotionRepository;
    constructor() {

        this.slackRepository = new SlackRepository();
        this.googlePubSubRepository = new GooglePubSubRepository();
        this.notionRepository = new NotionRepository();
    }
    public async generateDialog(schema: NotionDbSchema) {

        return await this.slackRepository.generateDialog(schema);
    }

    public async processDialog(message: any) {

        const record = this.slackRepository.mapSlackUIBlockToValuePair(message);
        return await this.notionRepository.addDatabaseRecord(message.view.private_metadata, record);
    }
    public async queueCommand(commandName: string, message: any) {

        if (commandName === SlackCommandType.NEW_RECORD) {

            const view_id = await this.slackRepository.initCommand(commandName, message);
            message.view_id = view_id;
        }
        return await this.googlePubSubRepository.Queue("command", { name: commandName, payload: message });

    }
    public async processCommand(command: any) {

        const commandName = command.name;
        const message = command.payload;
        if (commandName === SlackCommandType.NEW_RECORD) {

            const notionSchema = await new NotionRepository().getDatabaseSchema({ databaseTitle: message.text });
            return await this.slackRepository.processNewCommand(message, notionSchema);
        }
        else if (commandName === SlackCommandType.FIND_RECORD) {

            const notionSearchResults = await new NotionRepository().searchDatabase(message.text, "");
            return await this.slackRepository.processFindCommand(message, notionSearchResults);
        }
    }
    public async onInteraction(message: any) {

        console.log(message);
        if (message.type === "view_submission") {
            await this.processDialog(message);
            return;
        }

    }
}