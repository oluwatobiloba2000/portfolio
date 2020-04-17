import jwt from 'jsonwebtoken';
import {
    uuid
} from 'uuidv4'
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import SendEmailMessage from '../helpers/emailNotification';
import pool from '../models/index';
dotenv.config();

class Controller {
    static async sendMessage(req, res) {
        const id = uuid();
        const name = req.body.name;
        const message = req.body.message;
        const subject = req.body.subject;
        const senderEmailAddress = req.body.senderEmailAddress;
        const timeReceived = req.body.timeReceived;
        if (!id || !name || !message || !subject || !senderEmailAddress || !timeReceived) {
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            SendEmailMessage(res, senderEmailAddress , process.env.MY_EMAIL_ADDRESS, 'Anani Oluwatobiloba portfolio', `Dear ${name}, Your message has been recieved and you will get a reply soon`);
            const query = `INSERT INTO contactMe(id, name, message, subject, senderEmailAddress, timeReceived, timestamp) VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`
            const value = [id, name, message, subject, senderEmailAddress, timeReceived]
            const newMessage = await pool.query(query, value);
            return jsonFormatter.success(res, 'message sent', newMessage.rowCount, newMessage.rows);
        } catch (error) {
            console.error(error)
        }
    }

    static async GetMessage(req, res) {
        try {
            const query = `SELECT * from contactMe WHERE trash = 'false' ORDER BY TIMESTAMP`
            const messages = await pool.query(query);
            if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All messages', messages.rowCount, messages.rows);
        } catch (error) {
            console.log(error)
        }
    }
    //To view read and unread messages, 
    //fill the body with the word
    // "show read messages" or "show unread messages" or "show trash messages" or "show starred messages or show unstarred messages"
    // eg {"filterMessage": "show read messages"}
    // you need special admin key to pass here
    static FilterMessages(req, res) {
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
              return res.json(err)
            }else{
                var d = new Date(authorizedData.iat * 1000).toString();
                var e = new Date(authorizedData.exp * 1000).toString();
                console.log('issued at', d)
                console.log('expried at', e)
                let filterMessage = req.body.filterMessage;
                if (filterMessage == 'show read messages' || filterMessage == 'show unread messages') {
                    let filterMessageRequest = filterMessage == "show read messages" ? "true" : "false";
                    try {
                        const query = `SELECT * from contactMe WHERE read=$1 ORDER BY TIMESTAMP`
                        const value = [filterMessageRequest]
                        const messages = await pool.query(query, value);
                        if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                        return jsonFormatter.success(res, filterMessage == 'true' ? 'Read messages' : 'Unread messages', messages.rowCount, messages.rows);
                    } catch (error) {
                        console.log(error)
                    }
                } else if(filterMessage == 'show trash messages') {
                   const trashMessages = 'true';
                   try{
                       const query = `SELECT * from contactMe WHERE trash=$1 ORDER BY TIMESTAMP`
                       const value = [trashMessages]
                       const messages = await pool.query(query, value);
                       if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                       return jsonFormatter.success(res, 'trash messages', messages.rowCount, messages.rows);
                   }catch(e){
                       console.error(e)
                   }
                }if (filterMessage == 'show starred messages' || filterMessage == 'show unstarred messages') {
                    let filterMessageRequest = filterMessage == "show starred messages" ? "true" : "false";
                    try {
                        const query = `SELECT * from contactMe WHERE star=$1 ORDER BY TIMESTAMP`
                        const value = [filterMessageRequest]
                        const messages = await pool.query(query, value);
                        if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                        return jsonFormatter.success(res, filterMessage == 'true' ? 'starred messages' : 'unstarred messages', messages.rowCount, messages.rows);
                    } catch (error) {
                        console.log(error)
                    }
                }else {
                    return jsonFormatter.error(res, 'field needed are "show read messages" or "show unread messages" or "show trash messages" or "show starred messages" or "show unstarred messages"', 400);
                }
            }
        })
    }
    
}

export default Controller;