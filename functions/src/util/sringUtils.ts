const crypto = require('crypto');


export class StringUtils {


    static toHash(url: string): string {

        return crypto.createHash('sha1').update(url).digest('hex');

    }
}