
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
import {uuid} from 'uuidv4';
import chalk from 'chalk';

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
            return jsonFormatter.error(res, 'All fields are required !', 400, undefined, 'invalid');
        }
        try {
            const query = `SELECT created_at from blogviews WHERE ip=$1 AND created_at > NOW() - INTERVAL '10 minutes'`;
            const blogIdValue = [ip]
            const IPview = await pool.query(query, blogIdValue);
            
            if(IPview.rows.length) return jsonFormatter.success(res, 'IP not added yet because it is not 10 mins', undefined, IPview.rows, undefined, 'invalid');
            
            const queryAddIP = `INSERT INTO blogviews(id, blogId, ip) VALUES($1, $2, $3) RETURNING *`
            const value = [id, blogId, ip]
            const newAddedIP = await pool.query(queryAddIP, value);
            return jsonFormatter.success(res, 'IP added to post view', newAddedIP.rowCount, undefined, 201, 'posted');
        }catch(err){
            return log(error('Error from : src/contollers/blogViewsController.js - addBlogView'), errorMessage(err));
        }
    }

    static async GetViews (req, res){
            try {
                      const query = `SELECT COUNT(*) from blogViews`
                      const blogViews = await pool.query(query);
                      if(blogViews.rows[0].count <= 0) return jsonFormatter.success(res, 'no view', blogViews.rows[0].count);
                      return jsonFormatter.success(res, 'All Blog views', blogViews.rows[0].count, undefined,undefined, 'all');
                  }catch(err){
                      return log(error('Error from : src/controllers/blogViewsController.js - GetViews'), errorMessage(err));
                  }
    }

    static async GetUniqueViews (req, res){
        try {
                  const query = `SELECT DISTINCT ip from blogViews`
                  const blogViews = await pool.query(query);
                  if(blogViews.rows[0].count <= 0) return jsonFormatter.success(res, 'no view', blogViews.rows[0].count);
                  return jsonFormatter.success(res, 'All unique Blog views', blogViews.rowCount, undefined,undefined, 'all');
              }catch(err){
                  return log(error('Error from : src/controllers/blogViewsController.js - GetViews'), errorMessage(err));
              }
}
}

export default Controller;