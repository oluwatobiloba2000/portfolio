import jwt from 'jsonwebtoken';
import {uuid} from 'uuidv4'
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller {
    static async sendMessage(req, res) {
        const name = req.body.name;
        const message = req.body.message;
        const subject = req.body.subject;
        const senderEmailAddress = req.body.senderEmailAddress;
        const timeReceived = req.body.timeReceived;
        if (!name || !message || !subject || !senderEmailAddress || !timeReceived) {
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            const query = `INSERT INTO contactMe(name, message, subject, senderEmailAddress, timeReceived, timestamp) VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`
            const value = [name, message, subject, senderEmailAddress, timeReceived]
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

    //To view read and unread messages, fill the body with the word "read messages" or "unread messages"
    static async FilterMessages(req, res) {
        const filterMessage = req.body.filterMessage;
        const filterMessageRequest = filterMessage == "read messages" ? "true" : "false";
        console.log(filterMessageRequest)
        if (filterMessageRequest == "true" || filterMessageRequest == "false") {
            try {
                const query = `SELECT * from contactMe WHERE read=$1 ORDER BY TIMESTAMP`
                const value = [filterMessageRequest]
                const messages = await pool.query(query, value);
                if (!messages.rows.length) return jsonFormatter.success(res, 'empty');
                return jsonFormatter.success(res, filterMessage == 'true' ? 'Read messages' : 'Unread messages', messages.rowCount, messages.rows);
            } catch (error) {
                console.log(error)
            }
        } else {
            return jsonFormatter.error(res, 'field needed are "read messages" or "unread messages"', 400);
        }
    }

    static async deleteMessage(req, res){
        const id = req.params.id;

        try{
            const query = `DELETE from contactMe WHERE id=$1`
            const value = [id];
            const messageToDelete = await pool.query(query, value);
            if(!messageToDelete.rowCount) return jsonFormatter.error(res, 'message not found', 404)
            return jsonFormatter.success(res, 'message deleted');
        }catch(e){
            console.error(e)
        }
    }

    // this controller is to star a message
    //to star a message do this in the body
    //  {
    //   "star": "star message"
    //  }
    static async starMessage(req, res){
        const id = req.params.id;
        try{
            const query = `SELECT * FROM contactMe WHERE id=$1`
            const value = [id];
            const formerMessage = await pool.query(query, value);
            if(!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
            const formerMessageToUpdate = formerMessage.rows[0];
            const star = req.body.star || formerMessageToUpdate.star;
            if (star !== 'star message') return jsonFormatter.error(res, 'To star a message type **star message** to the body', 400)
            const starMessageRequest = star == 'star message' ? 'true' : 'false';
            if(formerMessageToUpdate.star == 'true') return jsonFormatter.error(res, 'message has been starred', 400)
            const updatequery = `UPDATE contactMe SET star=$1 WHERE id=$2 RETURNING *`
            const updateValues = [starMessageRequest, id];
            const newStarredMessage = await pool.query(updatequery, updateValues);
            return jsonFormatter.success(res, 'message starred', newStarredMessage.rowCount, newStarredMessage.rows);
        }catch(e){
            console.error(e)
        }
    }
}

export default Controller;