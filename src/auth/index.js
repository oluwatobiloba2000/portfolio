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
      if(!email || !password) return jsonFormatter.error(res, "Username and password are required", 401)
      if(!(/[\w]+@[a-zA-Z]+\.[a-zA-Z]{2}/.test(email))) return jsonFormatter.error(res, 'invalid email', 401)
        const checkEmailQuery = `SELECT * FROM userDetails WHERE email=$1`
        const value = [email];
        const returnedData = await pool.query(checkEmailQuery, value);
      if(!returnedData.rows[0]) return jsonFormatter.error(res, 'incorrect email or password', 401, returnedData)
       const match = await bcrypt.compare(password, returnedData.rows[0].password);
      if(match) {
        jwt.sign({email, password} , process.env.EMAIL_AND_PASSWORD_KEY, {expiresIn : '2h'} , (err, token)=>{
        if(err){
            return log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
        }else{
            log(success('success from : src/auth/index.js - logInAuthUser'), successMessage('Login admin success'));
            return jsonFormatter.tokenFormat(res, 'Login Admin success', token)
        }})
    }
    else {
        return jsonFormatter.error(res, 'incorrect email or password', 401)
    }
    }catch(err){
        log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
    }}

    // this controller is for second step Authentication which requests for a special pin
    static async PinAuth(req ,res){
        const pin = req.body.pin;
        try{
          if(!pin) return jsonFormatter.error(res,"Incorrect pin", 401);
        else{
            const checkPinQuery = `SELECT * FROM userDetails`
            const returnedData = await pool.query(checkPinQuery);
        if(!returnedData.rows[0]) return jsonFormatter.error(res, 'could not get user', 404)
        const match = await bcrypt.compare(pin,  returnedData.rows[0].specialpin);
        if(match) {
         jwt.sign({pin} , process.env.SPECIAL_PIN_KEY, {expiresIn : '1h'} , (err, token)=>{
            if(err){
               return log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
            }else{
                return jsonFormatter.tokenFormat(res, 'pin token generated', token)
            }})
            }else { return jsonFormatter.error(res, 'Incorrect pin', 401)}}
        }catch(err){
            log(error('Error from : src/auth/index.js - logInAuthUser'), errorMessage(err));
        }}

   // this controller is  to authenticate visitors to the admin dashboard
    static async VisitorAuth(req ,res){
        const email = req.body.email;
        const password = req.body.password;
        try{
          if(!email || !password) return jsonFormatter.error(res,"All fields are required", 400);
        else{
            const checkPinQuery = `SELECT * FROM visitorTable WHERE email=$1`;
            const value  = [email]
            const returnedData = await pool.query(checkPinQuery, value);
           if(!returnedData.rows[0]) return jsonFormatter.error(res, 'Username or password does not exist', 404)
           if(returnedData.rows[0].used === 'true') return jsonFormatter.error(res, 'Your session has expired', 401)
        const match = await password ===  returnedData.rows[0].passphase
        if(match) {
            const checkPinQuery = `UPDATE visitorTable SET used='true' WHERE email=$1 AND PassPhase=$2`;
            const valueCheck  = [email, password]
            const returnedData = await pool.query(checkPinQuery, valueCheck);
         jwt.sign({email, password} , process.env.EMAIL_AND_PASSWORD_KEY, {expiresIn : '600000'} , (err, token)=>{
            if(err){
               return log(error('Error from : src/auth/index.js - VisitorAuth'), errorMessage(err));
            }else{
                return jsonFormatter.tokenFormat(res, `Vistor token generated for : ${email}`, token)
            }})
            }else { return jsonFormatter.error(res, 'Incorrect Username or Password', 401)}}
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