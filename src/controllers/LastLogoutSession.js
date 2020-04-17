import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller{
    static async updateLogoutSession(req, res){
        const id = req.params.id;
   //This controller is to be used when the user logot, save the time the user logout
        try{
            const query = `SELECT * FROM profile WHERE id=$1`
            const value = [id];
            const formerProfile = await pool.query(query, value);
            if(!formerProfile.rows.length) return jsonFormatter.error(res, 'profile not found', 404)
            const formerProfileToUpdate = formerProfile.rows[0];
            const lastLogout = req.body.lastLogout   || formerProfileToUpdate.lastLogout;
            const updatequery = `UPDATE profile SET lastLogout=$1 WHERE id=$2 RETURNING lastLogout`
            const updateValues = [lastLogout, id];
            const newLogoutSession = await pool.query(updatequery, updateValues);
            return jsonFormatter.success(res, 'Logout saved', newLogoutSession.rowCount,newLogoutSession.rows);
        }catch(e){
            console.error(e)
        }
    }
}

export default Controller;