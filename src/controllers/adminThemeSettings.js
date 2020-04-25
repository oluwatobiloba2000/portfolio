import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import chalk from 'chalk';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import { uuid } from 'uuidv4';
import TimeMessage from '../../TimeDetection';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;

class Controller{
    // you need a special pin to unlock this
    //YOU ARE TO ADD THEME ID AND USER ID WHEN YOU ARE CREATING A VISITOR
    static async addThemeSettingsAdmin (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
            }else{
                const userId = req.query.userID;
                  if(!userId){
                      return jsonFormatter.error(res, 'query required !', 400, undefined, 'fields required');
                    }
                    try {
                        const checkPinQuery = `SELECT * FROM AdminThemeTable WHERE userId=$1`;
                        const value  = [userId]
                        const returnedData = await pool.query(checkPinQuery, value);
                        if(returnedData.rows[0]) return jsonFormatter.error(res, 'Theme already exist for this user', 404, undefined, 'invalid')
                        const themeId = uuid();
                      const query = `INSERT INTO AdminThemeTable(userId, themeId) VALUES($1, $2) RETURNING *`
                      const ThemeIdvalue = [userId, themeId]
                      const newAdminTheme = await pool.query(query, ThemeIdvalue);
                      return jsonFormatter.success(res, 'theme created', newAdminTheme.rowCount, newAdminTheme.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/adminThemeSettings.js - addThemeSettingsAdmin'), errorMessage(err));
                  }
              }})
    }
    //this is an open route
    static async getAdminTheme (req, res){
        try {
            const query = `SELECT * from AdminThemeTable`;
            const AdminTheme = await pool.query(query);
            if(!AdminTheme.rows.length) return jsonFormatter.success(res, 'empty', undefined, TimeMessage());
            return jsonFormatter.success(res, 'Admin Theme', AdminTheme.rowCount, AdminTheme.rows, undefined, 'all');
        }catch(err){
            log(error('Error from : src/contollers/adminThemeController.js - getAdminTheme'), errorMessage(err));
        }
    }

    static async updateAdminTheme(req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
            }else{
                const userId = req.query.userID;
                const themeId = req.query.themeID;
                  try{
                      const query = `SELECT * FROM AdminThemeTable WHERE userId=$1 AND themeId=$2`
                      const value = [userId, themeId];
                      const formerTheme = await pool.query(query, value);
                      if(!formerTheme.rows.length) return jsonFormatter.error(res, 'Theme not found', 404, undefined, 'not found')
                      const formerThemeToUpdate = formerTheme.rows[0];
                      console.log(formerTheme.rows[0])
                      const themeName = req.body.themename || formerThemeToUpdate.themeName;
                      const primaryColor = req.body.primarycolor  ||  formerThemeToUpdate.primarycolor;
                      const sideNavState = req.body.sidenavstate || formerThemeToUpdate.sidenavstate;
                      const topNavState = req.body.topnavstate || formerThemeToUpdate.topnavstate;
                      const fontSize = req.body.fontsize || formerThemeToUpdate.fontsize;
                      const updatequery = `UPDATE AdminThemeTable SET themeName=$1, primaryColor=$2, sideNavState=$3, topNavState=$4, fontSize=$5 RETURNING *`
                      const updateValues = [themeName, primaryColor, sideNavState, topNavState, fontSize];
                      const newTheme = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'Theme updated', newTheme.rowCount, newTheme.rows, undefined, 'updated');
                  }catch(e){
                    log(error('Error from : src/contollers/adminThemeSettings.js - updateAdminTheme'), errorMessage(e));
                  }
              }})
    }
}

export default Controller;