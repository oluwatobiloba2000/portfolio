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
            const query = `INSERT INTO skills(name, SkillsPics, skillLinkWebsite, timestamp) VALUES($1, $2, $3, CURRENT_TIMESTAMP) RETURNING *`
            const value = [name, SkillsPics, skillLinkWebsite]
            const newSkills = await pool.query(query, value);
            return jsonFormatter.success(res, 'skill posted', newSkills.rowCount, newSkills.rows);
        }catch(error){
            console.error(error)
        }
    }

    static async getSkills (req, res){
        try{
            const query = `SELECT * FROM skills ORDER BY TIMESTAMP`
            const skills = await pool.query(query);
            if(!skills.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All Skills', skills.rowCount, skills.rows)
        }catch(e){
            console.error(e);
        }
    }
    static async updateSkills (req, res){
        const id = req.params.id;

        try{
            const query = `SELECT * FROM skills WHERE id=$1`
            const value = [id];
            const formerSkills = await pool.query(query, value);
            if(!formerSkills.rows.length) return jsonFormatter.error(res, 'skills not found', 404)
            const formerSkillsToUpdate = formerSkills.rows[0];
            const name = req.body.name || formerSkillsToUpdate.name;
            const SkillsPics = req.body.SkillsPics || formerSkillsToUpdate.SkillsPics;
            const skillLinkWebsite = req.body.skillLinkWebsite || formerSkillsToUpdate.skillLinkWebsite;
            const updatequery = `UPDATE skills SET name=$1, skillsPics=$2, skillLinkWebsite=$3 WHERE id=$4 RETURNING *`
            const updateValues = [name, SkillsPics, skillLinkWebsite, id];
            const newSkills = await pool.query(updatequery, updateValues);
            return jsonFormatter.success(res, 'skill updated', newSkills.rowCount, newSkills.rows);
        }catch(e){
            console.error(e)
        }
    }

    static async deleteSkill (req, res){
        const id = req.params.id;

        try{
            const query = `DELETE FROM skills WHERE id=$1`
            const value = [id];
            const skill = await pool.query(query, value);
            if(!skill.rowCount) return jsonFormatter.error(res, 'skills not found', 404)
            return jsonFormatter.success(res, 'skill deleted');
        }catch(e){
            console.error(e)
        }
    }
}

export default Controller;