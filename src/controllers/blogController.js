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
    static async addBlog (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
            }else{
                   const id = uuid();
                  const title = req.body.title;
                  const category = req.body.category;
                  const picture = req.body.picture;
                  const date = req.body.date;
                  const time = req.body.time;
                  const story = req.body.story;
                  if(!id ||!title || !category || !picture || !date || !time || !story ){
                      return jsonFormatter.error(res, 'All fields are required !', 400, undefined, 'fields required');
                  }
                  try {
                      const query = `INSERT INTO blog(id, title, category, picture, date, time, story, timestamp) VALUES($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) RETURNING *`
                      const value = [id, title, category, picture, date, time, story]
                      const newBlog = await pool.query(query, value);
                      return jsonFormatter.success(res, 'blog posted', newBlog.rowCount, newBlog.rows, 201, 'posted');
                  }catch(err){
                    log(error('Error from : src/contollers/blogController.js - addBlog'), errorMessage(err));
                  }
              }})
    }
    //this is an open route
    static async GetBlog (req, res){
        const start = parseInt(req.query.start);
        const count = parseInt(req.query.count);
        try {
            const query = `SELECT * from blog ORDER BY TIMESTAMP OFFSET($1) LIMIT($2)`
            const values = [start, count]
            const blog = await pool.query(query, values);
            if(!blog.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All blog', blog.rowCount, blog.rows, undefined, 'all');
        }catch(err){
            log(error('Error from : src/contollers/blogController.js - GetBlog'), errorMessage(err));
        }
    }

        //this is an open route and it gets a single blog
        static async GetABlog (req, res){
            const BlogID = req.params.blogId;
            try {
                const query = `SELECT * from blog WHERE id=$1`
                const value = [BlogID]
                const blog = await pool.query(query, value);
                if(!blog.rows.length) return jsonFormatter.error(res, 'no blog associated with this ID', 404, undefined, 'not found');
                return jsonFormatter.success(res, 'blog', blog.rowCount, blog.rows, undefined, 'all');
            }catch(err){
                log(error('Error from : src/contollers/blogController.js - GetABlog'), errorMessage(err));
            }
        }

    static async updateBlog(req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;
                  try{
                      const query = `SELECT * FROM blog WHERE id=$1`
                      const value = [id];
                      const formerBlog = await pool.query(query, value);
                      if(!formerBlog.rows.length) return jsonFormatter.error(res, 'blog not found', 404, undefined, 'not found')
                      const formerBlogToUpdate = formerBlog.rows[0];
                      const title = req.body.title || formerBlogToUpdate.title;
                      const category = req.body.category  ||  formerBlogToUpdate.category;
                      const picture = req.body.picture || formerBlogToUpdate.picture;
                      const date = req.body.date || formerBlogToUpdate.date;
                      const time = req.body.time || formerBlogToUpdate.time;
                      const story = req.body.story || formerBlogToUpdate.story;
                      const updated = req.body.updated || formerBlogToUpdate.updated;
                      const updatequery = `UPDATE blog SET title=$1, category=$2, picture=$3, date=$4, time=$5, story=$6, updated=$7 WHERE id=$8 RETURNING *`
                      const updateValues = [title, category, picture, date, time, story, updated, id];
                      const newBlog = await pool.query(updatequery, updateValues);
                      return jsonFormatter.success(res, 'blog updated', newBlog.rowCount, newBlog.rows, undefined, 'updated');
                  }catch(e){
                    log(error('Error from : src/contollers/blogController.js - updateBlog'), errorMessage(e));
                  }
              }})
    }
    static async deleteBlog (req, res){
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            if(err){
                return res.status(403).json(err)
              }else{
                  const id = req.params.id;

                  try{
                      const query = `DELETE FROM blog WHERE id=$1`
                      const value = [id];
                      const project = await pool.query(query, value);
                      if(!project.rowCount) return jsonFormatter.error(res, 'blog not found', 404, undefined, 'not found')
                      return jsonFormatter.success(res, 'blog deleted', undefined, undefined, 'deleted');
                  }catch(e){
                    log(error('Error from : src/contollers/blogController.js - deleteBlog'), errorMessage(e));
                  }
              }})

    }
}

export default Controller;