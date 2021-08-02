
const { PubSub } = require('@google-cloud/pubsub');
export class GooglePubSubRepository {

    public async Queue(suffix:string, request: any) {

        const data = JSON.stringify(request);
        const dataBuffer = Buffer.from(data);
        const pubsubClient = new PubSub();
        await pubsubClient
            .topic('slack-request')
            .publish(dataBuffer);
    }
}