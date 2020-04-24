import jwt from 'jsonwebtoken';
import {
    uuid
} from 'uuidv4'
import dotenv from 'dotenv';
import chalk from 'chalk';
import jsonFormatter from '../helpers/jsonFormat';
import SendEmailMessage from '../helpers/emailNotification';
import pool from '../models/index';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;

class Controller {
    static async draftMessage(req, res) {
        const id = req.body.messageId;
        const sender = process.env.MY_EMAIL_ADDRESS;
        const reciever = req.body.reciever;
        const subject = req.body.subject;
        const time = req.body.time;
        const date = req.body.date;
        const message = req.body.message;
        try {
            if (!message) return jsonFormatter.error(res, 'cannot save message as draft with an empty message !', 400, undefined, 'invalid');
            if(!id){
                if(!date || !time) return jsonFormatter.error(res, 'date and time are needed', 400, undefined, 'fields required')
                const NewID = uuid();
                const draft = 'true';
                const query = `INSERT INTO adminMessage(messageId, sender, reciever, time, date,subject, message, draft , timestamp) VALUES($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`
                const value = [NewID, sender, reciever, time, date, subject, message, draft]
                const newMessage = await pool.query(query, value);
                return jsonFormatter.success(res, 'new message saved as draft', newMessage.rowCount, newMessage.rows, 201, 'drafted');
            }

            const query = `SELECT * from adminMessage WHERE messageId=$1 AND draft = 'true'`
            const checkId = [id]
            const Checkedmessage = await pool.query(query, checkId);
            if(!Checkedmessage.rows.length){ return jsonFormatter.error(res, 'message not found', 404)}
                const formerMessageToUpdate = Checkedmessage.rows[0];
                const newReciever = req.body.reciever || formerMessageToUpdate.reciever;
                const newTime = req.body.time || formerMessageToUpdate.time;
                const newDate = req.body.date || formerMessageToUpdate.date;
                const newSubject = req.body.subject || formerMessageToUpdate.subject;
                const newMessage  = req.body.message || formerMessageToUpdate.message;
                const updatequery = `UPDATE adminMessage SET reciever=$1, time=$2, date=$3, subject=$4, message=$5  WHERE messageId=$6 RETURNING *`
                const updateValues = [newReciever, newTime, newDate, newSubject, newMessage, id];
                const newDraftedMessage = await pool.query(updatequery, updateValues);
                return jsonFormatter.success(res, 'updated message saved', newDraftedMessage.rowCount, newDraftedMessage.rows, undefined, 'drafted');
            
        } catch (err) {
            log(error('Error from : src/contollers/adminMessage.js - draftMessage'), errorMessage(err));
        }
    }

}

export default Controller;