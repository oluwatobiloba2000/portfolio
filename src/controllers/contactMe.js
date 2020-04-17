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

   
}

export default Controller;