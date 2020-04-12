import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller{
    static async sendMessage (req, res){
        const name = req.body.name;
        const message = req.body.message;
        const subject = req.body.subject;
        const senderEmailAddress = req.body.senderEmailAddress;
        const timeReceived = req.body.timeReceived;
        if(!name || !message || !subject || !senderEmailAddress || !timeReceived ){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            const query = `INSERT INTO contactMe(name, message, subject, senderEmailAddress, timeReceived, timestamp) VALUES($1, $2, $3, $4, $5, CURRENT_DATE) RETURNING *`
            const value = [name, message, subject, senderEmailAddress, timeReceived]
            const newMessage = await pool.query(query, value);
            return jsonFormatter.success(res, 'message sent', newMessage.rowCount, newMessage.rows);
        }catch(error){
            console.error(error)
        }
    }

    static async GetMessage (req, res){
        try {
            const query = `SELECT * from contactMe WHERE trash = 'false'`
            const messages = await pool.query(query);
            if(!messages.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All messages', messages.rowCount, messages.rows);
        }catch(error){
            console.log(error)
        }
    }

    //To view read and unread messages
    static async FilterMessages(req, res){
        const filterMessage = req.body.filterMessage;
        if(!filterMessage == 'true' || !filterMessage == 'false') return jsonFormatter.error(res, 'Boolean field needed true or false', 400);
        try {
            const query = `SELECT * from contactMe WHERE read=$1`
            const value = [filterMessage]
            const messages = await pool.query(query, value);
            if(!messages.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res,  filterMessage == 'true' ? 'Read messages' : 'Unread messages', messages.rowCount, messages.rows);
        }catch(error){
            console.log(error)
        }
    }
    
    
}

export default Controller;