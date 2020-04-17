import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import {uuid} from 'uuidv4';
dotenv.config();

class Controller{
    static async addAnActivity (req, res){
        const id = uuid();
        const body = req.body.body;
        const timeRecieved = req.body.timeRecieved;

        if(!id  || !body || !timeRecieved){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            const query = `INSERT INTO activity(id, body, timeRecieved, timestamp) VALUES($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`
            const value = [id, body, timeRecieved]
            const newActvity = await pool.query(query, value);
            return jsonFormatter.success(res, 'activity posted', newActvity.rowCount, newActvity.rows);
        }catch(error){
            console.error(error)
        }
    }

 
}

export default Controller;