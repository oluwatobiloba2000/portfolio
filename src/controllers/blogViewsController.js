import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import {uuid} from 'uuidv4';
import chalk from 'chalk';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;

class Controller{
    static async addBlogView (req, res){
        const id = uuid();
        const blogId = req.params.blogId;
        const ip = req.body.IP;

        if(!id  || !blogId || !ip){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            const query = `SELECT * from blogviews WHERE blogId=$1 AND ip=$2`;
            const blogIdValue = [blogId, ip]
            const IPview = await pool.query(query, blogIdValue);
            if(IPview.rows.length) return jsonFormatter.success(res, 'IP already exist for post');
            const queryAddIP = `INSERT INTO blogviews(id, blogId, ip) VALUES($1, $2, $3) RETURNING *`
            const value = [id, blogId, ip]
            const newAddedIP = await pool.query(queryAddIP, value);
            return jsonFormatter.success(res, 'IP added to post view', newAddedIP.rowCount, '', 201);
        }catch(err){
            return log(error('Error from : src/contollers/blogViewsController.js - addBlogView'), errorMessage(err));
        }
    }

}

export default Controller;