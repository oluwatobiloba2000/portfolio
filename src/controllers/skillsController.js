import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller{
    static async addSkills (req, res){
        const name = req.body.name;
        const SkillsPics = req.body.SkillsPics;
        const skillLinkWebsite = req.body.skillLinkWebsite;
        if(!name || !SkillsPics || !skillLinkWebsite){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            const query = `INSERT INTO skills(name, SkillsPics, skillLinkWebsite, timestamp) VALUES($1, $2, $3, CURRENT_DATE) RETURNING *`
            const value = [name, SkillsPics, skillLinkWebsite]
            const newSkills = await pool.query(query, value);
            return jsonFormatter.success(res, 'skill posted', newSkills.rowCount, newSkills.rows);
        }catch(error){
            console.error(error)
        }
    }

    static async getSkills (req, res){
        try{
            const query = `SELECT * FROM skills`
            const skills = await pool.query(query);
            if(!skills.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All Skills', skills.rowCount, skills.rows)
        }catch(e){
            console.error(e);
        }
    }
   
    
}

export default Controller;