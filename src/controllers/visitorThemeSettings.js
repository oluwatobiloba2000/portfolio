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
    //YOU ARE TO ADD THEME ID AND USER ID WHEN YOU ARE CREATING A VISITOR
    static async addThemeSettingsVisitor (req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
            }else{
                const userId = req.query.userID;
                  if(!userId){
                      return jsonFormatter.error(res, 'query required !', 400, undefined, 'fields required');
                    }
                    try {
                        const checkPinQuery = `SELECT * FROM VisitorThemeTable WHERE userId=$1`;
                        const value  = [userId]
                        const returnedData = await pool.query(checkPinQuery, value);
                        if(returnedData.rows[0]) return jsonFormatter.error(res, 'Theme already exist for this user', 404, undefined, 'invalid')
                        const themeId = uuid();
                      const query = `INSERT INTO VisitorThemeTable(userId, themeId) VALUES($1, $2) RETURNING *`
                      const ThemeIdvalue = [userId, themeId]
                      const newVisitorTheme = await pool.query(query, ThemeIdvalue);
                      return jsonFormatter.success(res, 'theme created', newVisitorTheme.rowCount, newVisitorTheme.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/visitorThemeSettings.js - addThemeSettingsVisitor'), errorMessage(err));
                  }
              }})
    }
    //this is an open route
    static async getVisitorTheme (req, res){
        const userId = req.query.userID;
        try {
            if(!userId)  return jsonFormatter.error(res, 'query required !', 400, undefined, 'fields required');
            const query = `SELECT * from VisitorThemeTable WHERE userId=$1`;
            const value = [userId]
            const userTheme = await pool.query(query, value);
            if(!userTheme.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'visitor Theme', userTheme.rowCount, userTheme.rows, undefined, 'all');
        }catch(err){
            log(error('Error from : src/contollers/adminThemeController.js - getVisitorTheme'), errorMessage(err));
        }
    }

    static async updateVisitorTheme(req, res){
        jwt.verify(req.token, process.env.EMAIL_AND_PASSWORD_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
            }else{
                const userId = req.query.userID;
                const themeId = req.query.themeID;
                  try{
                      const query = `SELECT * FROM VisitorThemeTable WHERE userId=$1 AND themeId=$2`
                      const value = [userId, themeId];
                      const formerTheme = await pool.query(query, value);
                      if(!formerTheme.rows.length) return jsonFormatter.error(res, 'Theme not found', 404, undefined, 'not found')
                      const formerThemeToUpdate = formerTheme.rows[0];
                      const themename = req.body.themename || formerThemeToUpdate.themename;
                      const primarycolor = req.body.primarycolor  ||  formerThemeToUpdate.primarycolor;
                      const sidenavstate = req.body.sidenavstate || formerThemeToUpdate.sideNnavstate;
                      const topnavstate = req.body.topnavstate || formerThemeToUpdate.topnavstate;
                      const fontsize = req.body.fontsize || formerThemeToUpdate.fontsize;
                      const updatequery = `UPDATE AdminThemeTable SET themeName=$1, primaryColor=$2, sideNavState=$3, topNavState=$4, fontSize=$5 RETURNING *`
                      const updateValues = [themename, primarycolor, sidenavstate, topnavstate, fontsize];
                      const newTheme = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'Theme updated', newTheme.rowCount, newTheme.rows, undefined, 'updated');
                  }catch(e){
                    log(error('Error from : src/contollers/adminThemeSettings.js - updateAdminTheme'), errorMessage(e));
                  }
              }})
    }
}

export default Controller;