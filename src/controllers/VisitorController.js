import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import RandomPassword from 'generate-password';
import pool from '../models/index';
import chalk from 'chalk';
import {uuid} from 'uuidv4';
import SendNotificationEmail from '../helpers/emailNotification';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;

class Controller{
    static async addVisitor (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                const passPhaseGenerator = RandomPassword.generate({
                    length: 25,
                    numbers: true
                });
                const id = uuid()
                  const email = req.body.email;
                  const timeCreated = req.body.timeCreated;
                  const gender = req.body.gender;
                  const PassPhase = passPhaseGenerator;
                  if(!id || !email || !timeCreated || !PassPhase || !gender){
                      return jsonFormatter.error(res, 'All fields are required !', 400, 'fields required');
                  }
                  try {
                       const visitorquerycheck = `SELECT * from visitorTable WHERE email=$1`;
                       const valueCheck = [email];
                      const visitor = await pool.query(visitorquerycheck, valueCheck);
                      if(visitor.rows.length) return jsonFormatter.error(res, 'email already exist and cannot be added', 400, undefined, 'invalid');
                      // SendNotificationEmail(res, email, process.env.MY_EMAIL_ADDRESS, 'Anani Oluwatobiloba Porfolio', `congrats !, You have been granted permission to access my dashboard : this message is for ${email}`);
                      const query = `INSERT INTO visitorTable(id, email, gender, PassPhase,timeCreated, timestamp) VALUES($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`
                      const value = [id, email, gender, PassPhase, timeCreated]
                      const newVisitor = await pool.query(query, value);
                      return jsonFormatter.success(res, 'New visitor created', newVisitor.rowCount, newVisitor.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/VisitorController.js - addVisitor'), errorMessage(err));
                  }
              }})
    }

    static async GetAllVisitor (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                    const start = parseInt( req.query.start);
                    const count = parseInt(req.query.count);
                  try {
                      const query = `SELECT * from visitorTable ORDER BY TIMESTAMP OFFSET($1) LIMIT($2)`
                      const value = [start, count]
                      const AllVisitors = await pool.query(query, value);
                      if(!AllVisitors.rows.length) return jsonFormatter.success(res, 'empty');
                      return jsonFormatter.success(res, 'All visitors', AllVisitors.rowCount, AllVisitors.rows, undefined, 'all');
                  }catch(err){
                    log(error('Error from : src/contollers/VisitorController.js - GetAllVisitor'), errorMessage(err));
                  }
              }})
    }

    static async RegeneratePassPhase(req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  const email = req.params.email;
                  const timeCreated = req.body.timeCreated;
                  const passPhaseGenerator = RandomPassword.generate({
                      length: 25,
                      numbers: true
                  });
                  try{
                      const used = 'false';
                      const query = `SELECT * FROM visitorTable WHERE email=$1 AND id=$2`
                      const value = [email, id];
                      const formerPassPhase = await pool.query(query, value);
                      if(!formerPassPhase.rows.length) return jsonFormatter.error(res, 'Vistor not found', 404, undefined, 'not found')
                      if(formerPassPhase.rows[0].used == 'false') return jsonFormatter.error(res, 'session still active', 400, undefined, 'invalid')
                      const formerPassPhaseToUpdate = formerPassPhase.rows[0];
                      const PassPhase = passPhaseGenerator  || formerPassPhaseToUpdate.PassPhase;
                      const updatequery = `UPDATE visitorTable SET passPhase=$1, used=$2, timeCreated=$3 WHERE id=$4 AND email=$5 RETURNING *`
                      const updateValues = [ PassPhase,used, timeCreated, id, email];
                      const newPassPhase = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'passphase updated', newPassPhase.rowCount, newPassPhase.rows, undefined, 'updated');
                  }catch(err){
                    log(error('Error from : src/contollers/VisitorController.js - RegeneratePassPhase'), errorMessage(err));
                  }
              }})
    }

    static async deleteVisitor (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;

                  try{
                      const query = `DELETE FROM visitorTable WHERE id=$1`
                      const value = [id];
                      const project = await pool.query(query, value);
                      if(!project.rowCount) return jsonFormatter.error(res, 'visitor not found', 404, undefined, 'not found')
                      return jsonFormatter.success(res, 'visitor deleted');
                  }catch(err){
                    log(error('Error from : src/contollers/VisitorController.js - deleteVisitor'), errorMessage(err));
                  }
              }})
            }

 
}

export default Controller;