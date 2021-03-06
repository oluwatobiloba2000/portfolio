import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { uuid } from 'uuidv4';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import bcrypt from 'bcrypt';
import SendNotificationEmail from '../helpers/emailNotification';
dotenv.config();

class Controller{
    static async addLoginDetails (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                  const id = uuid();
                  const username = req.body.username;
                  const email = req.body.email;
                  const password = req.body.password;
                  const specialPin = req.body.specialPin;
                  if(!id || !username || !email || !specialPin){
                      return jsonFormatter.error(res, 'All fields are required !, set your username, email and specialPin', 400);
                  }
                  try {
                       const Loginquerycheck = `SELECT * from userDetails`
                      const LoginDetails = await pool.query(Loginquerycheck);
                      if(LoginDetails.rows.length) return jsonFormatter.error(res, 'Login details already exist and cannot be added, TIP: Update your login details', 400);
                         //  hash the incoming password
                      const salt = await bcrypt.genSalt(10);
                      const hashedSpecialPin = await bcrypt.hash(specialPin, salt)
                      const passphase = await bcrypt.hash(password, salt);
          
                      const query = `INSERT INTO userDetails(id, email, username, password, specialPin ) VALUES($1, $2, $3, $4, $5) RETURNING *`
                      const value = [id, email, username, passphase, hashedSpecialPin];
                      const newLoginDetails = await pool.query(query, value);
                      return jsonFormatter.success(res, 'Login Details Created', newLoginDetails.rowCount, newLoginDetails.rows);
                  }catch(error){
                      console.error(error)
                  }
              }})
    }

    static async GetLoginDetails (req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                  try {
                      const query = `SELECT id, username, email from userDetails`;
                      const LoginDetails = await pool.query(query);
                      if(!LoginDetails.rows.length) return jsonFormatter.success(res, 'empty');
                      return jsonFormatter.success(res, 'login details', LoginDetails.rowCount, LoginDetails.rows);
                  }catch(error){
                      console.log(error)
                  }
              }})
    }

    static async updateLoginDetails(req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                  const id = req.body.id;
                  const FormerPassword = req.body.FormerPassword;
                  const NewPassword = req.body.NewPassword;
                  try{
                      const query = `SELECT * FROM userDetails WHERE id=$1`
                      const value = [id];
                      const formerLoginDetails = await pool.query(query, value);
                      if(!formerLoginDetails.rows.length) return jsonFormatter.error(res, 'profile not found', 404)
          
                       const match = await bcrypt.compare(FormerPassword, formerLoginDetails.rows[0].password);
                       if(match){
                           const username = req.body.username  || formerLoginDetails.rows[0].username;
                              //  hash the incoming password
                              const salt = await bcrypt.genSalt(10);
                              const hashedNewPassword = await bcrypt.hash(NewPassword, salt)
                          SendNotificationEmail(res, process.env.MY_EMAIL_ADDRESS, 'ananioluwatobiloba2000@gmail.com', 'ALERT ! Personal details changed', `You just changed your details`)
                           const updatequery = `UPDATE userDetails SET password=$1, username=$2 WHERE id=$3 RETURNING *`
                           const updateValues = [hashedNewPassword, username, id];
                           const newLoginDetails = await pool.query(updatequery, updateValues);
                           return jsonFormatter.success(res, 'Login details updated', newLoginDetails.rowCount, newLoginDetails.rows);
          
                       }else{
                           return jsonFormatter.error(res, 'password does not match');
                       }
                  }catch(e){
                      console.error(e)
                  }
              }})
    }
}

export default Controller;