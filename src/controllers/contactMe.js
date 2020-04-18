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
            return jsonFormatter.success(res, 'message sent', newMessage.rowCount, newMessage.rows, 201);
        } catch (err) {
            log(error('Error from : src/contollers/contactMe.js - sendMessage'), errorMessage(err));
        }
    }

    static async GetMessage(req, res) {
        try {
            const query = `SELECT * from contactMe WHERE trash = 'false' ORDER BY TIMESTAMP`
            const messages = await pool.query(query);
            if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All messages', messages.rowCount, messages.rows);
        } catch (err) {
            log(error('Error from : src/contollers/contactMe.js - Getmessage'), errorMessage(err));
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
              return res.status(403).json(err)
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
                    } catch (err) {
                        log(error('Error from : src/contollers/contactMe.js - filterMessage'), errorMessage(err));
                    }
                } else if(filterMessage == 'show trash messages') {
                   const trashMessages = 'true';
                   try{
                       const query = `SELECT * from contactMe WHERE trash=$1 ORDER BY TIMESTAMP`
                       const value = [trashMessages]
                       const messages = await pool.query(query, value);
                       if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                       return jsonFormatter.success(res, 'trash messages', messages.rowCount, messages.rows);
                   }catch(err){
                    log(error('Error from : src/contollers/contactMe.js - sendMessage'), errorMessage(err));
                   }
                }if (filterMessage == 'show starred messages' || filterMessage == 'show unstarred messages') {
                    let filterMessageRequest = filterMessage == "show starred messages" ? "true" : "false";
                    try {
                        const query = `SELECT * from contactMe WHERE star=$1 ORDER BY TIMESTAMP`
                        const value = [filterMessageRequest]
                        const messages = await pool.query(query, value);
                        if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                        return jsonFormatter.success(res, filterMessage == 'true' ? 'starred messages' : 'unstarred messages', messages.rowCount, messages.rows);
                    } catch (errr) {
                        log(error('Error from : src/contollers/contactMe.js - sendMessage'), errorMessage(err));
                    }
                }else {
                    return jsonFormatter.error(res, 'field needed are "show read messages" or "show unread messages" or "show trash messages" or "show starred messages" or "show unstarred messages"', 400);
                }
            }
        })
    }
    // you need special admin key to open this
    static async deleteMessage(req, res) {
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
        const id = req.params.id;
        try {
            const query = `SELECT * from contactMe WHERE id=$1`
            const value = [id]
            const messages = await pool.query(query, value);
            if (!messages.rowCount) {
                return jsonFormatter.error(res, 'message not found', 404)
            } else if (messages.rows[0].trash == 'false') {
                return jsonFormatter.success(res, 'message must be trashed first before it can be deleted');
            } else {
                const query = `DELETE from contactMe WHERE id=$1`
                const value = [id];
                const messageToDelete = await pool.query(query, value);
                return jsonFormatter.success(res, 'message deleted')
            }
        } catch (err) {
            log(error('Error from : src/contollers/contactMe.js - deleteMessage'), errorMessage(err));
        }}})
    }

    // this controller is to star a message
    //you need normal admin key to pass this
    static async starMessage(req, res) {
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try {
                      const query = `SELECT * FROM contactMe WHERE id=$1`
                      const value = [id];
                      const formerMessage = await pool.query(query, value);
                      if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
                      const formerMessageToUpdate = formerMessage.rows[0];
                      if (formerMessageToUpdate.star == 'true') return jsonFormatter.error(res, 'message has been starred', 400)
                      const starMessageRequest = 'true';
                      const updatequery = `UPDATE contactMe SET star=$1 WHERE id=$2 RETURNING *`
                      const updateValues = [starMessageRequest, id];
                      const newStarredMessage = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'message starred', newStarredMessage.rowCount, newStarredMessage.rows);
                  } catch (err) {
                    log(error('Error from : src/contollers/contactMe.js - starMessage'), errorMessage(err));
                  }
              }
        })
    }

    // this controller is to unstar a message
    // you need normal admin key to pass here
    static async unstarMessage(req, res) {
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try {
                      const query = `SELECT * FROM contactMe WHERE id=$1`
                      const value = [id];
                      const formerMessage = await pool.query(query, value);
                      if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
                      const formerMessageToUpdate = formerMessage.rows[0];
                      if (formerMessageToUpdate.star == 'false') return jsonFormatter.error(res, 'message has been unstarred', 400)
                      const starMessageRequest = 'false';
                      const updatequery = `UPDATE contactMe SET star=$1 WHERE id=$2 RETURNING *`
                      const updateValues = [starMessageRequest, id];
                      const newStarredMessage = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'message unstarred', newStarredMessage.rowCount, newStarredMessage.rows);
                  } catch (err) {
                    log(error('Error from : src/contollers/contactMe.js - unstarMessage'), errorMessage(err));
                  }
              }})
    }

    // this controller is to trash a message
    // to trash a message, pass time to the body
    // eg. {
    // "timetrashed": "13th april 2020 at 2:00pm"
    // }
    //you need special admin key to unlock this controller
    static async trashMessage(req, res) {
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try {
                      const query = `SELECT * FROM contactMe WHERE id=$1`
                      const value = [id];
                      const formerMessage = await pool.query(query, value);
                      if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
                      const formerMessageToUpdate = formerMessage.rows[0];
                      if (formerMessageToUpdate.trash == 'true') return jsonFormatter.error(res, 'message has been trashed permanently', 400)
                      const timeTrashed = req.body.timetrashed;
                      if(!timeTrashed) return jsonFormatter.error(res, 'time is needed to passed to the body', 400)
                      const trashMessageRequest = 'true';
                      const updatequery = `UPDATE contactMe SET trash=$1, timeTrashed=$2 WHERE id=$3 RETURNING *`
                      const updateValues = [trashMessageRequest, timeTrashed, id];
                      const newTrashedMessage = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'message trashed', newTrashedMessage.rowCount, newTrashedMessage.rows);
                  } catch (err) {
                    log(error('Error from : src/contollers/contactMe.js - trashMessage'), errorMessage(err));
                  }
               }})
    }

    // this controller is to read a message
    //you need special pin to unlock this controller
    static async readMessage(req, res) {
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try {
                      const query = `SELECT * FROM contactMe WHERE id=$1`
                      const value = [id];
                      const formerMessage = await pool.query(query, value);
                      if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
                      const formerMessageToUpdate = formerMessage.rows[0];
                     if (formerMessageToUpdate.read == 'true') return jsonFormatter.error(res, 'message has been marked as read', 400)
                      const MarkAsReadMessageRequest = 'true';
                      const updatequery = `UPDATE contactMe SET read=$1 WHERE id=$2 RETURNING *`
                      const updateValues = [MarkAsReadMessageRequest, id];
                      const newMessageRead = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'message marked as read', newMessageRead.rowCount, newMessageRead.rows);
                  } catch (err) {
                    log(error('Error from : src/contollers/contactMe.js - readMessage'), errorMessage(err));
                  }
              }})
    }

        // this controller is to read a message
        //you need special pin to unlock this controller
    static async unreadMessage(req, res) {
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try {
                      const query = `SELECT * FROM contactMe WHERE id=$1`
                      const value = [id];
                      const formerMessage = await pool.query(query, value);
                      if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
                      const formerMessageToUpdate = formerMessage.rows[0];
                      if (formerMessageToUpdate.read == 'false') return jsonFormatter.error(res, 'message has been marked as unread', 400)
                      const MarkAsReadUnMessageRequest = 'false'
                      const updatequery = `UPDATE contactMe SET read=$1 WHERE id=$2 RETURNING *`
                      const updateValues = [MarkAsReadUnMessageRequest, id];
                      const newMessageRead = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'message marked as unread', newMessageRead.rowCount, newMessageRead.rows);
                  } catch (err) {
                    log(error('Error from : src/contollers/contactMe.js - unreadMessage'), errorMessage(err));
                  }
              }})
    }
}

export default Controller;