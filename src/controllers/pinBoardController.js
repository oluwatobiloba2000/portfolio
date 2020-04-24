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

// action keywords : 
// 400 - bad request
// 400 - invalid
// 401 - incorrect pin
// 401 - check if visitor [when the user has tried to login, first check if it is admin then check if it is the visitor]
// 401 - fields required
// 401 - not exist
// 201 - posted
// 200 - all
// 200 - updated
// 404 - not found
// 200 - deleted
// 200 - message & activity - read
// 200 - message - unread
// 200 - message - sent

class Controller{
    static async addPinBoard (req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = uuid();
                  const title = req.body.title;
                  const body = req.body.body;
                  const dateTime = req.body.dateTime;

                  if(!title || !body || !dateTime ){
                      return jsonFormatter.error(res, 'All fields are required !', 400, undefined, 'bad request');
                  }
                  try {
                      const query = `INSERT INTO pinBoard(pinBoardId , title, body, dateTime, timestamp) VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`
                      const value = [id, title, body, dateTime]
                      const newPinBoard = await pool.query(query, value);
                      return jsonFormatter.success(res, 'pin board posted', newPinBoard.rowCount, newPinBoard.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/pinBoardController.js - addPinBoard'), errorMessage(err));
                  }
              }})
    }

  
}

export default Controller;