import * as express from "express";
import * as functions from "firebase-functions";
import { validateSlackSignature } from "./middleware/slack-verification";
import * as slack from "./routes/slack/slack"; 
import * as triggers from "./triggers"

const app = express();

express.urlencoded()

app.use(express.urlencoded({
    extended: true,
})); 

app.use("/slack2",validateSlackSignature, slack.router); 
app.use("/slack", slack.router); 
app.use(express.json());
app.use(function (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) {

    console.error(err.stack)
    res.status(500).send({ error: err.message });
});

app.get("*", async (req: express.Request, res: express.Response) => {

    console.log(req.url);
    res.status(404).send("This route does not exist.");
});

exports.api = functions.https.onRequest(app);
exports.triggers = { ...triggers }