import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import chalk from 'chalk';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import { uuid } from 'uuidv4';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;

class Controller{
    // you need a special pin to unlock this
    static async addResume (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
            }else{
                  const id = uuid();
                  const title = req.body.title;
                  const category = req.body.category;
                  const startYear = req.body.startYear;
                  const endYear = req.body.endYear;
                  const location = req.body.location;
                  const body = req.body.body;
                  if(!id ||!title || !category || !startYear || !endYear || !location || !body ){
                      return jsonFormatter.error(res, 'All fields are required !', 400, undefined, 'fields required');
                  }
                  try {
                      const query = `INSERT INTO resume(id, title, category, startYear, endYear, location, body, timestamp) VALUES($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *`
                      const value = [id, title, category, startYear, endYear, location, body]
                      const newResume = await pool.query(query, value);
                      return jsonFormatter.success(res, 'new resume', newResume.rowCount, newResume.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/resumeController.js - addResume'), errorMessage(err));
                  }
              }})
    }

  
}

export default Controller;