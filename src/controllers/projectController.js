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
            const query = `INSERT INTO project(picture, hostedLink, githubLink, moreDetails, timestamp) VALUES($1, $2, $3, $4, CURRENT_DATE) RETURNING *`
            const value = [picture, hostedLink, githubLink, moreDetails]
            const newProject = await pool.query(query, value);
            return jsonFormatter.success(res, 'project posted', newProject.rowCount, newProject.rows);
        }catch(error){
            console.error(error)
        }
    }


}

export default Controller;