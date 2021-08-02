import * as functions from "firebase-functions";
import { SlackService } from "../service";


  export const onSlackRequest = functions.pubsub
  .topic('slack-request')
  .onPublish(async (message, context) => {

    const slackService= new SlackService();
    await slackService.processCommand(message.json);
     
});