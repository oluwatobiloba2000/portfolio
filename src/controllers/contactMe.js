import jwt from 'jsonwebtoken';
import {
    uuid
} from 'uuidv4'
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

    //To view read and unread messages, fill the body with the word "show read messages" or "show unread messages"
    static async FilterMessages(req, res) {
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
        }else {
            return jsonFormatter.error(res, 'field needed are "show read messages" or "show unread messages" or "show trash messages"', 400);
        }
    }

    static async deleteMessage(req, res) {
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
        } catch (e) {
            console.error(e)
        }
    }

    // this controller is to star a message
    //to star a message do this in the body
    //  {
    //   "star": "star message"
    //  }
    static async starMessage(req, res) {
        const id = req.params.id;
        try {
            const query = `SELECT * FROM contactMe WHERE id=$1`
            const value = [id];
            const formerMessage = await pool.query(query, value);
            if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
            const formerMessageToUpdate = formerMessage.rows[0];
            const star = req.body.star || formerMessageToUpdate.star;
            if (star !== 'star message') return jsonFormatter.error(res, 'To star a message type **star message** to the body', 400)
            const starMessageRequest = star == 'star message' ? 'true' : 'false';
            if (formerMessageToUpdate.star == 'true') return jsonFormatter.error(res, 'message has been starred', 400)
            const updatequery = `UPDATE contactMe SET star=$1 WHERE id=$2 RETURNING *`
            const updateValues = [starMessageRequest, id];
            const newStarredMessage = await pool.query(updatequery, updateValues);
            return jsonFormatter.success(res, 'message starred', newStarredMessage.rowCount, newStarredMessage.rows);
        } catch (e) {
            console.error(e)
        }
    }

    // this controller is to unstar a message
    //to star a message do this in the body
    //  {
    //   "star": "unstar message"
    //  }
    static async unstarMessage(req, res) {
        const id = req.params.id;
        try {
            const query = `SELECT * FROM contactMe WHERE id=$1`
            const value = [id];
            const formerMessage = await pool.query(query, value);
            if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
            const formerMessageToUpdate = formerMessage.rows[0];
            const star = req.body.star || formerMessageToUpdate.star;
            if (star !== 'unstar message') return jsonFormatter.error(res, 'To unstar a message type **unstar message** to the body', 400)
            const starMessageRequest = star == 'unstar message' ? 'false' : 'true';
            if (formerMessageToUpdate.star == 'false') return jsonFormatter.error(res, 'message has been unstarred', 400)
            const updatequery = `UPDATE contactMe SET star=$1 WHERE id=$2 RETURNING *`
            const updateValues = [starMessageRequest, id];
            const newStarredMessage = await pool.query(updatequery, updateValues);
            return jsonFormatter.success(res, 'message unstarred', newStarredMessage.rowCount, newStarredMessage.rows);
        } catch (e) {
            console.error(e)
        }
    }

    // this controller is to trash a message
    //to trash a message do this in the body
    //  {
    //   "trash": "trash message"
    //  }
    static async trashMessage(req, res) {
        const id = req.params.id;
        try {
            const query = `SELECT * FROM contactMe WHERE id=$1`
            const value = [id];
            const formerMessage = await pool.query(query, value);
            if (!formerMessage.rows.length) return jsonFormatter.error(res, 'message not found', 404)
            const formerMessageToUpdate = formerMessage.rows[0];
            const trash = req.body.trash || formerMessageToUpdate.trash;
            if (trash !== 'trash message') return jsonFormatter.error(res, 'To trash a message type **trash message** to the body', 400)
            const trashMessageRequest = trash == 'trash message' ? 'true' : 'false';
            if (formerMessageToUpdate.trash == 'true') return jsonFormatter.error(res, 'message has been trashed permanently', 400)
            const updatequery = `UPDATE contactMe SET trash=$1 WHERE id=$2 RETURNING *`
            const updateValues = [trashMessageRequest, id];
            const newStarredMessage = await pool.query(updatequery, updateValues);
            return jsonFormatter.success(res, 'message trashed', newStarredMessage.rowCount, newStarredMessage.rows);
        } catch (e) {
            console.error(e)
        }
    }


}

export default Controller;