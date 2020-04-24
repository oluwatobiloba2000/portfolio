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

    static async getResume (req, res){
        try{
            const query = `SELECT * FROM resume ORDER BY TIMESTAMP`
            const value = [start, count];
            const resume = await pool.query(query, value);
            if(!skills.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All resume', resume.rowCount, resume.rows, undefined, 'all')
        }catch(err){
            log(error('Error from : src/contollers/resumeController.js - getResume'), errorMessage(err));
        }
    }

    static async updateResume(req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try{
                      const query = `SELECT * FROM resume WHERE id=$1`
                      const value = [id];
                      const formerResume = await pool.query(query, value);
                      if(!formerResume.rows.length) return jsonFormatter.error(res, 'resume not found', 404, undefined, 'not found')
                      const formerResumeToUpdate = formerResume.rows[0];
                      const title = req.body.title || formerResumeToUpdate.title;
                      const category = req.body.category  ||  formerResumeToUpdate.category;
                      const startYear = req.body.startYear || formerResumeToUpdate.startYear;
                      const endYear = req.body.endYear || formerResumeToUpdate.endYear;
                      const location = req.body.location || formerResumeToUpdate.location;
                      const body = req.body.body || formerResumeToUpdate.body;
                      const updatequery = `UPDATE resume SET title=$1, category=$2, startYear=$3, endYear=$4, location=$5, body=$6 WHERE id=$7 RETURNING *`
                      const updateValues = [title, category, startYear, endYear, location, body, id];
                      const newresume = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'resume updated', newresume.rowCount, newresume.rows, undefined, 'updated');
                  }catch(e){
                    log(error('Error from : src/contollers/resumeController.js - updateResume'), errorMessage(e));
                  }
              }})
    }
    static async deleteResume (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;

                  try{
                      const query = `DELETE FROM resume WHERE id=$1`
                      const value = [id];
                      const resume = await pool.query(query, value);
                      if(!resume.rowCount) return jsonFormatter.error(res, 'resume not found', 404, undefined, 'not found')
                      return jsonFormatter.success(res, 'resume deleted', undefined, undefined,undefined, 'deleted');
                  }catch(e){
                    log(error('Error from : src/contollers/resumeController.js - deleteResume'), errorMessage(e));
                  }
              }})

    }
}

export default Controller;