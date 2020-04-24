import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { uuid } from 'uuidv4';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import bcrypt from 'bcrypt';
import chalk from 'chalk';
import SendNotificationEmail from '../helpers/emailNotification';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;


class Controller{
    static async addLoginDetails (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = uuid();
                  const username = req.body.username;
                  const email = req.body.email;
                  const password = req.body.password;
                  const specialPin = req.body.specialPin;
                  if(!id || !username || !email || !specialPin){
                      return jsonFormatter.error(res, 'All fields are required !, set your username, email and specialPin', 400, undefined, 'fields required');
                  }
                  try {
                       const Loginquerycheck = `SELECT * from userDetails`
                      const LoginDetails = await pool.query(Loginquerycheck);
                      if(LoginDetails.rows.length) return jsonFormatter.error(res, 'Login details already exist and cannot be added, TIP: Update your login details', 400, undefined, 'invalid');
                         //  hash the incoming password
                      const salt = await bcrypt.genSalt(10);
                      const hashedSpecialPin = await bcrypt.hash(specialPin, salt)
                      const passphase = await bcrypt.hash(password, salt);
          
                      const query = `INSERT INTO userDetails(id, email, username, password, specialPin ) VALUES($1, $2, $3, $4, $5) RETURNING *`
                      const value = [id, email, username, passphase, hashedSpecialPin];
                      const newLoginDetails = await pool.query(query, value);
                      return jsonFormatter.success(res, 'Login Details Created', newLoginDetails.rowCount, newLoginDetails.rows, 201, 'posted');
                  }catch(err){
                    return log(error('Error from : src/contollers/addLoginDetails.js - addLoginDetails'), errorMessage(err));
                  }
              }})
    }

    static async GetLoginDetails (req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  try {
                      const query = `SELECT id, username, email from userDetails`;
                      const LoginDetails = await pool.query(query);
                      if(!LoginDetails.rows.length) return jsonFormatter.success(res, 'empty');
                      return jsonFormatter.success(res, 'login details', LoginDetails.rowCount, LoginDetails.rows, undefined, 'all');
                  }catch(err){
                   return log(error('Error from : src/contollers/addLoginDetails.js - addLoginDetails'), errorMessage(err));
                  }
              }})
    }

 
}

export default Controller;