
import * as express from "express";
import { SlackService } from "../../service";
export const router = express.Router(); 

router.post("/command/:commandName", async function (req: express.Request, res: express.Response) {

   try {

      const commandName = req.params.commandName;
      await new SlackService().queueCommand(commandName, req.body);
      res.status(200).send({ "text": "Thanks for your request, we'll process it and get back to you." });
   }
   catch (err) {

      res.status(500).send({ error: err.message, trace: err.stack });
   }

});
router.post("/interaction", async function (req: express.Request, res: express.Response) {

   try {

      //console.log(req);
      await new SlackService().onInteraction(JSON.parse(req.body.payload));
      res.status(200).send();
   }
   catch (err) {

      console.log(err);
      res.status(500).send({ error: err.message, trace: err.stack });
   }

});