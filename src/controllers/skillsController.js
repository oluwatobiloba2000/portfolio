import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import chalk from 'chalk';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import { uuid } from "uuidv4";
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;


class Controller{
    static async addSkills (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = uuid()
                  const name = req.body.name;
                  const SkillsPics = req.body.SkillsPics;
                  const skillLinkWebsite = req.body.skillLinkWebsite;
                  if(!id || !name || !SkillsPics || !skillLinkWebsite){
                      return jsonFormatter.error(res, 'All fields are required !', 400, undefined, 'fields required');
                  }
                  try {
                      const query = `INSERT INTO skills(id, name, SkillsPics, skillLinkWebsite, timestamp) VALUES($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`
                      const value = [id, name, SkillsPics, skillLinkWebsite]
                      const newSkills = await pool.query(query, value);
                      return jsonFormatter.success(res, 'skill posted', newSkills.rowCount, newSkills.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/skillsController.js - addSkills'), errorMessage(err));
                  }
              }})
    }

    static async getSkills (req, res){
        const start = parseInt(req.query.start);
        const count = parseInt(req.query.count);
        try{
            const query = `SELECT * FROM skills ORDER BY TIMESTAMP OFFSET($1) LIMIT($2)`
            const value = [start, count];
            const skills = await pool.query(query, value);
            if(!skills.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All Skills', skills.rowCount, skills.rows, undefined, 'all')
        }catch(err){
            log(error('Error from : src/contollers/skillsController.js - getSkills'), errorMessage(err));
        }
    }
    static async updateSkills (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
          
                  try{
                      const query = `SELECT * FROM skills WHERE id=$1`
                      const value = [id];
                      const formerSkills = await pool.query(query, value);
                      if(!formerSkills.rows.length) return jsonFormatter.error(res, 'skills not found', 404, undefined, 'not found')
                      const formerSkillsToUpdate = formerSkills.rows[0];
                      const name = req.body.name || formerSkillsToUpdate.name;
                      const SkillsPics = req.body.SkillsPics || formerSkillsToUpdate.SkillsPics;
                      const skillLinkWebsite = req.body.skillLinkWebsite || formerSkillsToUpdate.skillLinkWebsite;
                      const updatequery = `UPDATE skills SET name=$1, skillsPics=$2, skillLinkWebsite=$3 WHERE id=$4 RETURNING *`
                      const updateValues = [name, SkillsPics, skillLinkWebsite, id];
                      const newSkills = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'skill updated', newSkills.rowCount, newSkills.rows, undefined, 'updated');
                  }catch(err){
                    log(error('Error from : src/contollers/skillsController.js - updateSkills'), errorMessage(err));
                  }
              }})
    }

    static async deleteSkill (req, res){
        const id = req.params.id;

        try{
            const query = `DELETE FROM skills WHERE id=$1`
            const value = [id];
            const skill = await pool.query(query, value);
            if(!skill.rowCount) return jsonFormatter.error(res, 'skills not found', 404, undefined, 'not found')
            return jsonFormatter.success(res, 'skill deleted', undefined, undefined, undefined, 'deleted');
        }catch(err){
            log(error('Error from : src/contollers/skillsController.js - deleteSkill'), errorMessage(err));
        }
    }
}

export default Controller;