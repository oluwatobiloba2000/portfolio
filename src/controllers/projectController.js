import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller{
    static async addProject (req, res){
        const picture = req.body.picture;
        const hostedLink = req.body.hostedLink;
        const githubLink = req.body.githubLink;
        const moreDetails = req.body.moreDetails;
        if(!picture || !hostedLink || !githubLink || !moreDetails){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            const query = `INSERT INTO project(picture, hostedLink, githubLink, moreDetails, timestamp) VALUES($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *`
            const value = [picture, hostedLink, githubLink, moreDetails]
            const newProject = await pool.query(query, value);
            return jsonFormatter.success(res, 'project posted', newProject.rowCount, newProject.rows);
        }catch(error){
            console.error(error)
        }
    }

    static async getProjects (req, res){
        try{
            const query = `SELECT * FROM project ORDER BY TIMESTAMP`
            const project = await pool.query(query);
            if(!project.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All projects', project.rowCount, project.rows)
        }catch(e){
            console.error(e);
        }
    }
    
    static async updateProject (req, res){
        const id = req.params.id;

        try{
            const query = `SELECT * FROM project WHERE id=$1`
            const value = [id];
            const formerProject = await pool.query(query, value);
            if(!formerProject.rows.length) return jsonFormatter.error(res, 'project not found', 404)
            const formerProjectToUpdate = formerProject.rows[0];
            const picture = req.body.picture || formerProjectToUpdate.picture;
            const hostedLink = req.body.hostedLink || formerProjectToUpdate.hostedLink;
            const githubLink = req.body.githubLink || formerProjectToUpdate.githubLink;
            const moreDetails = req.body.moreDetails || formerProjectToUpdate.moreDetails;
            const updatequery = `UPDATE project SET picture=$1, hostedLink=$2, githubLink=$3 , moreDetails=$4 WHERE id=$5 RETURNING *`
            const updateValues = [picture, hostedLink, githubLink, moreDetails, id];
            const newProject = await pool.query(updatequery, updateValues);
            return jsonFormatter.success(res, 'skill updated', newProject.rowCount, newProject.rows);
        }catch(e){
            console.error(e)
        }
    }

    static async deleteProject (req, res){
        const id = req.params.id;

        try{
            const query = `DELETE FROM project WHERE id=$1`
            const value = [id];
            const project = await pool.query(query, value);
            if(!project.rowCount) return jsonFormatter.error(res, 'project not found', 404)
            return jsonFormatter.success(res, 'project deleted');
        }catch(e){
            console.error(e)
        }
    }
}

export default Controller;