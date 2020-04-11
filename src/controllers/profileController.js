import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller{
    static async addProfile (req, res){
        const name = req.body.name;
        const about = req.body.about;
        const profilePics = req.body.profilePics;
        const backgroundPics = req.body.backgroundPics;
        const birthday = req.body.birthday;
        const phoneNumber = req.body.phoneNumber;
        const cvLink = req.body.cvLink;
        const dateLunched = req.body.dateLunched;
        if(!name || !about || !profilePics || !backgroundPics || !birthday || !phoneNumber || !cvLink || !dateLunched){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
             const Profilequerycheck = `SELECT * from profile`
            const profile = await pool.query(Profilequerycheck);
            if(profile.rows.length) return jsonFormatter.error(res, 'profile already exist and cannot be added', 400);
            const query = `INSERT INTO profile(name, about, profilePics, backgroundPics, birthday, phoneNumber, cvLink, dateLunched) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`
            const value = [name, about, profilePics, backgroundPics, birthday, phoneNumber, cvLink, dateLunched]
            const newProfile = await pool.query(query, value);
            return jsonFormatter.success(res, 'profile posted', newProfile.rowCount, newProfile.rows);
        }catch(error){
            console.error(error)
        }
    }

}

export default Controller;