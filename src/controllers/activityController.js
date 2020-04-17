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

    static async Getactivities (req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                  try {
                      const query = `SELECT * from activity`
                      const activity = await pool.query(query);
                      if(!activity.rows.length) return jsonFormatter.success(res, 'empty');
                      return jsonFormatter.success(res, 'Activities', activity.rowCount, activity.rows);
                  }catch(error){
                      console.log(error)
                  }
              }})
    }

    static async readActvity(req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                  const id = req.params.id;
          
                  try{
                      const query = `SELECT * FROM activity WHERE id=$1`
                      const value = [id];
                      const formerActivity = await pool.query(query, value);
                      if(!formerActivity.rows.length) return jsonFormatter.error(res, 'activity not found', 404)
                      const updatequery = `UPDATE activity SET read='true' WHERE id=$1 RETURNING *`
                      const updateValues = [id];
                      const readActvity = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'activity read', readActvity.rowCount, readActvity.rows);
                  }catch(e){
                      console.error(e)
                  }
              }})
    }
}

export default Controller;