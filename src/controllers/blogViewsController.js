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

    static async GetViews (req, res){
        const blogId = req.params.blogId;
            try {
                      const query = `SELECT COUNT(*) from blogViews WHERE blogId=$1`
                      const value = [blogId]
                      const blogViews = await pool.query(query, value);
                      if(blogViews.rows[0].count <= 0) return jsonFormatter.success(res, 'no view', blogViews.rows[0].count);
                      return jsonFormatter.success(res, 'Blog views', blogViews.rows[0].count);
                  }catch(err){
                      return log(error('Error from : src/controllers/blogViewsController.js - GetViews'), errorMessage(err));
                  }
    }
}

export default Controller;