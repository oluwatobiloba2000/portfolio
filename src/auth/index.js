import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import chalk from "chalk";
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;

class Authentication{
  // logining in user
  static async logInAuthUser(req ,res){
    const email = req.body.email;
    const password  = req.body.password;
    try{
      if(!email || !password) return jsonFormatter.error(res, "Username and password are required", 401, undefined, 'bad request')
      if(!(/[\w]+@[a-zA-Z]+\.[a-zA-Z]{2}/.test(email))) return jsonFormatter.error(res, 'invalid email', 400, undefined, 'invalid')
        const checkEmailQuery = `SELECT * FROM userDetails WHERE email=$1`
        const value = [email];
        const returnedData = await pool.query(checkEmailQuery, value);
      if(!returnedData.rows[0]) return jsonFormatter.error(res, 'admin email or password does not exist', 401, returnedData, 'not exist')
       const match = await bcrypt.compare(password, returnedData.rows[0].password);
      if(match) {
        jwt.sign({email, password} , process.env.EMAIL_AND_PASSWORD_KEY, {expiresIn : '3d'} , (err, token)=>{
        if(err){
            return log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
        }else{
            log(success('success from : src/auth/index.js - logInAuthUser'), successMessage('Login admin success'));
            return jsonFormatter.tokenFormat(res, 'admin', token, email, returnedData.rows[0].id)
        }})
    }
    else {
        return jsonFormatter.error(res, 'check if it is a visitor', 401, undefined, 'check if visitor')
    }
    }catch(err){
        log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
    }}

    // this controller is for second step Authentication which requests for a special pin
    static async PinAuth(req ,res){
        const pin = req.body.pin;
        try{
          if(!pin) return jsonFormatter.error(res,"field required", 401, undefined, 'field required');
        else{
            const checkPinQuery = `SELECT * FROM userDetails`
            const returnedData = await pool.query(checkPinQuery);
        if(!returnedData.rows[0]) return jsonFormatter.error(res, 'could not get user', 404, undefined, 'not found')
        const match = await bcrypt.compare(pin,  returnedData.rows[0].specialpin);
        if(match) {
         jwt.sign({pin} , process.env.SPECIAL_PIN_KEY, {expiresIn : '3d'} , (err, token)=>{
            if(err){
               return log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
            }else{
                return jsonFormatter.tokenFormat(res, 'pin token generated', token)
            }})
            }else { return jsonFormatter.error(res, 'Incorrect pin', 401, undefined , 'invalid')}}
        }catch(err){
            log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
        }}

   // this controller is  to authenticate visitors to the admin dashboard
    static async VisitorAuth(req ,res){
        const email = req.body.email;
        const password = req.body.password;
        try{
          if(!email || !password) return jsonFormatter.error(res,"All fields are required", 400, undefined, 'fields required');
        else{
            const checkPinQuery = `SELECT * FROM visitorTable WHERE email=$1`;
            const value  = [email]
            const returnedDataFromLogin = await pool.query(checkPinQuery, value);
           if(!returnedDataFromLogin.rows[0]) return jsonFormatter.error(res, 'Username or password does not exist', 404, undefined, 'not exist')
        //    if(returnedDataFromLogin.rows[0].used === 'true') return jsonFormatter.error(res, 'Your session has expired', 401, undefined, 'session expired')
           const match = await password ===  returnedDataFromLogin.rows[0].passphase
        //    returnedDataFromLogin = returnedData
        if(match) {
            if(returnedDataFromLogin.rows[0].used === 'true') return jsonFormatter.error(res, 'Your session has been used or expired', 401, undefined, 'session expired')
            const checkPinQuery = `UPDATE visitorTable SET used='true', new='false' WHERE email=$1 AND PassPhase=$2 RETURNING *`;
            const valueCheck  = [email, password]
            const returnedDataFromUpdate = await pool.query(checkPinQuery, valueCheck);
         jwt.sign({email, password} , process.env.EMAIL_AND_PASSWORD_KEY, {expiresIn : '1d'} , (err, token)=>{
            if(err){
               return log(error('Error from : src/auth/index.js - VisitorAuth'), errorMessage(err));
            }else{
                return res.status(200).json({
                    description: 'visitor',
                    email: returnedDataFromUpdate.rows[0].email,
                    gender: returnedDataFromUpdate.rows[0].gender,
                    username: returnedDataFromUpdate.rows[0].username,
                    token,
                   id : returnedDataFromUpdate.rows[0].id
                })
            }})
            }else { return jsonFormatter.error(res, 'Incorrect Username or Password', 401, undefined, 'incorrect username or password')}}
        }catch(err){
            log(error('Error from : src/auth/index.js - VisitorAuth'), errorMessage(err));
        }}
    }

// checking if header is not undefined, if request is undefined return (403) bad request
const checkToken = (req, res, next) =>{
    const header = req.headers['authorization'];
    if(typeof header !== 'undefined'){
        const bearer = header.split(' ');
        const token = bearer[1];

        req.token = token;
        next();
    }else{
        // if header is undefined , return bad request
        log(error('Error from : src/auth/index.js - checkToken'), errorMessage('Token is needed for the route'));
        res.sendStatus(403)
    }
}

export {
    Authentication,
     checkToken
    };