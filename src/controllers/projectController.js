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
    static async addProject (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = uuid();
                  const picture = req.body.picture;
                  const hostedLink = req.body.hostedLink;
                  const githubLink = req.body.githubLink;
                 const  projectName = req.body.projectName;
                 const projectStatus =req.body.projectStatus;
                 const clientCompany = req.body.clientCompany;
                 const projectLeader = req.body.projectLeader;
                 const estimatedBudget = req.body.estimatedBudget;
                 const totalAmountSpent = req.body.totalAmountSpent;
                 const estimatedProjectDuration = req.body.estimatedProjectDuration;
                  const moreDetails = req.body.moreDetails;
                  if(!projectStatus || !projectName || !picture || !hostedLink || !githubLink || !moreDetails || !estimatedProjectDuration){
                      return jsonFormatter.error(res, 'All fields are required !', 400, undefined, 'fields required');
                  }
                  try {
                      const query = `INSERT INTO project(id , picture, hostedLink, githubLink, projectName,clientCompany, projectLeader, estimatedBudget ,projectStatus,totalAmountSpent, estimatedProjectDuration, moreDetails, timestamp) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12,CURRENT_TIMESTAMP) RETURNING *`
                      const value = [id, picture, hostedLink, githubLink, projectName, clientCompany , projectLeader, estimatedBudget ,projectStatus,totalAmountSpent, estimatedProjectDuration, moreDetails]
                      const newProject = await pool.query(query, value);
                      return jsonFormatter.success(res, 'project posted', newProject.rowCount, newProject.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/projectController.js - addproject'), errorMessage(err));
                  }
              }})
    }

    static async getProjects (req, res){
        const start = parseInt(req.query.start);
        const count = parseInt(req.query.count);
        try{
            const query = `SELECT * FROM project ORDER BY TIMESTAMP OFFSET($1) LIMIT($2)`
            const value = [start, count]
            const project = await pool.query(query, value);
            if(!project.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All projects', project.rowCount, project.rows, undefined, 'all')
        }catch(err){
            log(error('Error from : src/contollers/projectController.js - GetProject'), errorMessage(err));
        }
    }

    static async updateProject (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try{
                      const query = `SELECT * FROM project WHERE id=$1`
                      const value = [id];
                      const formerProject = await pool.query(query, value);
                      if(!formerProject.rows.length) return jsonFormatter.error(res, 'project not found', 404, undefined, 'not found')
                      const formerProjectToUpdate = formerProject.rows[0];
                      const picture = req.body.picture || formerProjectToUpdate.picture;
                      const hostedLink = req.body.hostedLink || formerProjectToUpdate.hostedLink;
                      const githubLink = req.body.githubLink || formerProjectToUpdate.githubLink;
                      const  projectName = req.body.projectName || formerProjectToUpdate.projectName;
                      const projectStatus =req.body.projectStatus || formerProjectToUpdate.projectStatus;
                      const clientCompany = req.body.clientCompany || formerProjectToUpdate.clientCompany;
                      const projectLeader = req.body.projectLeader || formerProjectToUpdate.projectLeader;
                      const estimatedBudget = req.body.estimatedBudget || formerProjectToUpdate.estimatedBudget;
                      const totalAmountSpent = req.body.totalAmountSpent || formerProjectToUpdate.totalAmountSpent;
                      const estimatedProjectDuration = req.body.estimatedProjectDuration || formerProjectToUpdate.estimatedProjectDuration;
                      const moreDetails = req.body.moreDetails || formerProjectToUpdate.moreDetails;
                      const updatequery = `UPDATE project SET picture=$1, hostedLink=$2, githubLink=$3 ,projectName=$4,clientCompany=$5, projectLeader=$6, estimatedBudget=$7 ,projectStatus=$8,totalAmountSpent=$9, estimatedProjectDuration=$10, moreDetails=$11 WHERE id=$12 RETURNING *`
                      const updateValues = [picture, hostedLink, githubLink, projectName,clientCompany, projectLeader, estimatedBudget ,projectStatus,totalAmountSpent, estimatedProjectDuration, moreDetails, id];
                      const newProject = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'skill updated', newProject.rowCount, newProject.rows, undefined , 'updated');
                  }catch(err){
                    log(error('Error from : src/contollers/projectController.js - updateProject'), errorMessage(err));
                  }
              }})
    }

    static async deleteProject (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  
                  try{
                      const query = `DELETE FROM project WHERE id=$1`
                      const value = [id];
                      const project = await pool.query(query, value);
                      if(!project.rowCount) return jsonFormatter.error(res, 'project not found', 404, undefined, undefined, 'not found')
                      return jsonFormatter.success(res, 'project deleted');
                  }catch(err){
                    log(error('Error from : src/contollers/projectController.js - deleteProject'), errorMessage(err));
                  }
              }})
    }
}

export default Controller;