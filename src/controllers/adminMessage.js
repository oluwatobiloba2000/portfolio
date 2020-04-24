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

   //To view draft and sent messages, 
    //fill the body with the word
    // "show draft messages" or "show sent messages"
    // eg {"filterMessage": "show draft messages"}
    // you need special admin key to pass here
    static FilterAdminMessages(req, res) {
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
              return res.status(403).json(err)
            }else{
                // var d = new Date(authorizedData.iat * 1000).toString();
                // var e = new Date(authorizedData.exp * 1000).toString();
                // console.log('issued at', d)
                // console.log('expried at', e)
                const start = parseInt( req.query.start);
                const count = parseInt(req.query.count);
                let filterMessage = req.body.filterMessage;
                
                if (filterMessage == 'show draft messages') {
                    let filterMessageRequest = filterMessage == "show draft messages" ? "true" : "false";
                    try {
                        const query = `SELECT * from adminMessage WHERE draft=$1 ORDER BY TIMESTAMP OFFSET($2) LIMIT($3) `
                        const value = [filterMessageRequest, start, count]
                        const messages = await pool.query(query, value);
                        if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                        return jsonFormatter.success(res, 'draft messages', messages.rowCount, messages.rows, undefined, 'all');
                    } catch (err) {
                        log(error('Error from : src/contollers/adminMessage.js - filterMessage - showing draft messages'), errorMessage(err));
                    }
                } else if(filterMessage == 'show sent messages') {
                   const sentMessagesRequest = 'true';
                   try{
                       const query = `SELECT * from adminMessage WHERE sent=$1 ORDER BY TIMESTAMP`
                       const value = [sentMessagesRequest]
                       const messages = await pool.query(query, value);
                       if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                       return jsonFormatter.success(res, 'sent messages', messages.rowCount, messages.rows, undefined, 'all');
                   }catch(err){
                    log(error('Error from : src/contollers/adminMessage.js - filterMessage'), errorMessage(err));
                   }
                }else{
                    return jsonFormatter.error(res, 'incorrect query string', undefined, 'invalid');
                }
            }
        })
    }
   

    static async sendMessageAdmin(req, res) {
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
              return res.status(403).json(err)
            }else{

                const id = req.body.messageId;
                const sender = process.env.MY_EMAIL_ADDRESS;
                const reciever = req.body.reciever;
                const subject = req.body.subject;
                const time = req.body.time;
                const date = req.body.date;
                const message = req.body.message;

                if (!message ||!sender || !reciever || !subject || !time || !date) {
                  console.log(message, sender, reciever, subject, time, date)
                    return jsonFormatter.error(res, 'All fields required!', 400, undefined, 'fields required');
                }
                try {
                    if(id){
                        const query = `SELECT * from adminMessage WHERE messageId=$1`
                        const checkId = [id]
                        const messages = await pool.query(query, checkId);
                        if(!messages.rows.length){ return jsonFormatter.error(res, 'message not found', 404, undefined, 'not found')}
                        const formerMessageToUpdate = messages.rows[0];
                        if(formerMessageToUpdate.sent == 'true') return jsonFormatter.error(res, 'message that has been sent cannot be resent', 400, undefined, 'invalid')
                        const sent = 'true';
                        const draft = formerMessageToUpdate.draft == 'true' ? 'false' : 'false';
                        const newReciever = req.body.reciever || formerMessageToUpdate.reciever;
                        const newTime = req.body.time || formerMessageToUpdate.time;
                        const newDate = req.body.date || formerMessageToUpdate.date;
                        const newSubject = req.body.subject || formerMessageToUpdate.subject;
                        const newMessage  = req.body.message || formerMessageToUpdate.message;
                        SendEmailMessage(res, newReciever , process.env.MY_EMAIL_ADDRESS, newSubject, newMessage);
        
                        const updatequery = `UPDATE adminMessage SET reciever=$1, time=$2, date=$3, subject=$4, message=$5, sent=$6, draft=$7 timestamp=CURRENT_TIMESTAMP  WHERE messageId=$8 RETURNING *`
                        const updateValues = [newReciever, newTime, newDate, newSubject, newMessage, sent,draft, id];
                        const newSentMessage = await pool.query(updatequery, updateValues);
                        return jsonFormatter.success(res, 'message sent', newSentMessage.rowCount, newSentMessage.rows, undefined, 'sent');
                    }else{
                        const NewID = uuid();
                        const sent = 'true';
                        SendEmailMessage(res, reciever , process.env.MY_EMAIL_ADDRESS, subject, message);
                        const query = `INSERT INTO adminMessage(messageId, sender, reciever, time, date,subject, message, sent , timestamp) VALUES($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING *`
                        const value = [NewID, sender, reciever, time, date, subject, message, sent]
                        const newMessage = await pool.query(query, value);
                        return jsonFormatter.success(res, 'message sent', newMessage.rowCount, newMessage.rows, 201, 'sent');
                    
                    }
                    
                } catch (err) {
                    log(error('Error from : src/contollers/adminMessage.js - sendMessage'), errorMessage(err));
                }
            }})
    }
}

export default Controller;