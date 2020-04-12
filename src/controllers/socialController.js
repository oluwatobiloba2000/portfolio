import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller{
    static async Getsocial (req, res){
        try {
            const query = `SELECT * from social ORDER BY TIMESTAMP`
            const social = await pool.query(query);
            if(!social.rows.length) return jsonFormatter.success(res, 'success', 200, social.rowCount, social);
            return jsonFormatter.success(res, 'success', 200, social.rowCount, social.rows);
        }catch(error){
            console.log(error)
        }
    }
}

export default Controller;