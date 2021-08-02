import { Configuration } from "../config";
import * as crypto from 'crypto';
const tsscmp = require('tsscmp');
import express = require("express");

export const validateSlackSignature = (req: express.Request,
    res: express.Response,
    next: express.NextFunction) => {

    let isAuthorized = false;
    const secret = Configuration.SLACK_SIGNING_SECRET;
    const status = 403;
    const unauthorizedResponse = {
        error: `Unauthorized request`,
    };
    const timestamp = req.headers['x-slack-request-timestamp'];
    const signature = req.headers['x-slack-signature'];
    if (!secret || !timestamp || !signature) {

        // Create the HMAC
        const hmac = crypto.createHmac('sha256', secret);
        const [version, hash] =  String(signature).split('=');
        const base = `${version}:${timestamp}:${JSON.stringify(req.body)}`;
        hmac.update(base);
        isAuthorized = tsscmp(hash, hmac.digest('hex'));
    }
    if (isAuthorized) {
        next();
    } else {
        return res.status(status).send(unauthorizedResponse);
    }
    return;
};