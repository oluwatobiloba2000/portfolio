import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import RandomPassword from 'generate-password';
import pool from '../models/index';
import {uuid} from 'uuidv4';
import SendNotificationEmail from '../helpers/emailNotification';
dotenv.config();

class Controller{
    static async addVisitor (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                const passPhaseGenerator = RandomPassword.generate({
                    length: 25,
                    numbers: true
                });
                const id = uuid()
                  const email = req.body.email;
                  const timeCreated = req.body.timeCreated;
                  const PassPhase = passPhaseGenerator;
                  if(!id || !email || !timeCreated || !PassPhase){
                      return jsonFormatter.error(res, 'All fields are required !', 400);
                  }
                  try {
                       const visitorquerycheck = `SELECT * from visitorTable WHERE email=$1`;
                       const valueCheck = [email];
                      const visitor = await pool.query(visitorquerycheck, valueCheck);
                      if(visitor.rows.length) return jsonFormatter.error(res, 'email already exist and cannot be added', 400);
                      SendNotificationEmail(res, email, process.env.MY_EMAIL_ADDRESS, 'Anani Oluwatobiloba Porfolio', `congrats !, You have been granted permission to access my dashboard : for ${email}`);
                      const query = `INSERT INTO visitorTable(id, email, PassPhase,timeCreated, timestamp) VALUES($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`
                      const value = [id, email, PassPhase, timeCreated]
                      const newVisitor = await pool.query(query, value);
                      return jsonFormatter.success(res, 'New visitor created', newVisitor.rowCount, newVisitor.rows, 201);
                  }catch(error){
                      console.error(error)
                  }
              }})
    }

    static async GetAllVisitor (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                  try {
                      const query = `SELECT * from visitorTable`
                      const AllVisitors = await pool.query(query);
                      if(!AllVisitors.rows.length) return jsonFormatter.success(res, 'empty');
                      return jsonFormatter.success(res, 'All visitors', AllVisitors.rowCount, AllVisitors.rows);
                  }catch(error){
                      console.log(error)
                  }
              }})
    }

    static async RegeneratePassPhase(req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
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
                      if(!formerPassPhase.rows.length) return jsonFormatter.error(res, 'Vistor not found', 404)
                      const formerPassPhaseToUpdate = formerPassPhase.rows[0];
                      const PassPhase = passPhaseGenerator  || formerPassPhaseToUpdate.PassPhase;
                      const updatequery = `UPDATE visitorTable SET passPhase=$1, used=$2, timeCreated=$3 WHERE id=$4 AND email=$5 RETURNING *`
                      const updateValues = [ PassPhase,used, timeCreated, id, email];
                      const newPassPhase = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'passphase updated', newPassPhase.rowCount, newPassPhase.rows);
                  }catch(e){
                      console.error(e)
                  }
              }})
    }

    static async deleteVisitor (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.json(err)
              }else{
                  const id = req.params.id;

                  try{
                      const query = `DELETE FROM visitorTable WHERE id=$1`
                      const value = [id];
                      const project = await pool.query(query, value);
                      if(!project.rowCount) return jsonFormatter.error(res, 'visitor not found', 404)
                      return jsonFormatter.success(res, 'visitor deleted');
                  }catch(e){
                      console.error(e)
                  }
              }})
            }
}

export default Controller;