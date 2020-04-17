import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import {uuid} from 'uuidv4';
dotenv.config();

class Controller{
    static async addProfile (req, res){
        const id = uuid();
        const name = req.body.name;
        const about = req.body.about;
        const profilePics = req.body.profilePics;
        const backgroundPics = req.body.backgroundPics;
        const birthday = req.body.birthday;
        const phoneNumber = req.body.phoneNumber;
        const cvLink = req.body.cvLink;
        const dateLunched = req.body.dateLunched;
        if(!id || !name || !about || !profilePics || !backgroundPics || !birthday || !phoneNumber || !cvLink || !dateLunched){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
             const Profilequerycheck = `SELECT * from profile`
            const profile = await pool.query(Profilequerycheck);
            if(profile.rows.length) return jsonFormatter.error(res, 'profile already exist and cannot be added', 400);
            const query = `INSERT INTO profile(id, name, about, profilePics, backgroundPics, birthday, phoneNumber, cvLink, dateLunched) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`
            const value = [id, name, about, profilePics, backgroundPics, birthday, phoneNumber, cvLink, dateLunched]
            const newProfile = await pool.query(query, value);
            return jsonFormatter.success(res, 'profile posted', newProfile.rowCount, newProfile.rows, 201);
        }catch(error){
            console.error(error)
        }
    }

    static async Getprofile (req, res){
        try {
            const query = `SELECT * from profile`
            const profile = await pool.query(query);
            if(!profile.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'your profile', profile.rowCount, profile.rows);
        }catch(error){
            console.log(error)
        }
    }

    static async updateProfile(req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
          
                  try{
                      const query = `SELECT * FROM profile WHERE id=$1`
                      const value = [id];
                      const formerProfile = await pool.query(query, value);
                      if(!formerProfile.rows.length) return jsonFormatter.error(res, 'profile not found', 404)
                      const formerProfileToUpdate = formerProfile.rows[0];
                      const name = req.body.name   || formerProfileToUpdate.name;
                      const about = req.body.about  || formerProfileToUpdate.about;
                      const profilePics = req.body.profilePics  || formerProfileToUpdate.profilePics;
                      const backgroundPics = req.body.backgroundPics  || formerProfileToUpdate.backgroundPics;
                      const birthday = req.body.birthday  || formerProfileToUpdate.birthday;
                      const phoneNumber = req.body.phoneNumber  || formerProfileToUpdate.phoneNumber;
                      const cvLink = req.body.cvLink  || formerProfileToUpdate.cvLink;
                      const dateLunched = req.body.dateLunched  || formerProfileToUpdate.dateLunched;
                      const updatequery = `UPDATE profile SET name=$1, about=$2, profilePics=$3, backgroundPics=$4, birthday=$5, phoneNumber=$6, cvLink=$7, dateLunched=$8 WHERE id=$9 RETURNING *`
                      const updateValues = [name, about, profilePics, backgroundPics, birthday, phoneNumber, cvLink, dateLunched, id];
                      const newProfile = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'profile updated', newProfile.rowCount, newProfile.rows);
                  }catch(e){
                      console.error(e)
                  }
              }})
    }
}

export default Controller;