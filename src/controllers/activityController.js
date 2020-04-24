import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import {uuid} from 'uuidv4';
import chalk from 'chalk';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;

class Controller{
    static async addAnActivity (req, res){
        const id = uuid();
        const body = req.body.body;
        const timeRecieved = req.body.timeRecieved;
        const dateRecieved = req.body.dateRecieved;

        if(!id  || !body || !timeRecieved || !dateRecieved){
            return jsonFormatter.error(res, 'All fields are required !', 400, 'bad request');
        }
        try {
            const query = `INSERT INTO activity(id, body, timeRecieved, dateRecieved, timestamp) VALUES($1, $2, $3, $4 ,CURRENT_TIMESTAMP) RETURNING *`
            const value = [id, body, timeRecieved, dateRecieved]
            const newActvity = await pool.query(query, value);
            return jsonFormatter.success(res, 'activity posted', newActvity.rowCount, newActvity.rows, 201, 'posted');
        }catch(err){
            return log(error('Error from : src/contollers/activityController.js - addAnActivity'), errorMessage(err));
        }
    }

    static async Getactivities (req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            const start = parseInt(req.query.start);
            const count = parseInt(req.query.count);
           if(err){
                return res.status(403).json(err)
            }else{
                  try {
                      const query = `SELECT * FROM activity ORDER BY TIMESTAMP OFFSET($1) LIMIT($2)`
                      const values = [start, count]
                      const activity = await pool.query(query, values);
                      if(!activity.rows.length) return jsonFormatter.success(res, 'empty');
                      return jsonFormatter.success(res, 'Activities', activity.rowCount, activity.rows, undefined, 'all');
                  }catch(err){
                      return log(error('Error from : src/controllers/activityController.js - Getactivities'), errorMessage(err));
                  }
              }})
    }

    static async readActvity(req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
          
                  try{
                      const query = `SELECT * FROM activity WHERE id=$1`
                      const value = [id];
                      const formerActivity = await pool.query(query, value);
                      if(!formerActivity.rows.length) return jsonFormatter.error(res, 'activity not found', 404, undefined, 'not found')
                      const updatequery = `UPDATE activity SET read='true' WHERE id=$1 RETURNING *`
                      const updateValues = [id];
                      const readActvity = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'activity read', readActvity.rowCount, readActvity.rows, undefined, 'read');
                  }catch(e){
                     return log(error('Error from : src/controllers/readActvity.js - Getactivities'), errorMessage(e));
                  }
              }})
    }
}

export default Controller;