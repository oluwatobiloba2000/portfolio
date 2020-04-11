import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import pool from '../models/index';
dotenv.config();

class Controller{
    static async addBlog (req, res){
        const title = req.body.title;
        const category = req.body.category;
        const picture = req.body.picture;
        const date = req.body.date;
        const time = req.body.time;
        const story = req.body.story;
        if(!title || !category || !picture || !date || !time || !story ){
            return jsonFormatter.error(res, 'All fields are required !', 400);
        }
        try {
            const query = `INSERT INTO blog(title, category, picture, date, time, story, timestamp) VALUES($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING *`
            const value = [title, category, picture, date, time, story]
            const newBlog = await pool.query(query, value);
            return jsonFormatter.success(res, 'blog posted', newBlog.rowCount, newBlog.rows);
        }catch(error){
            console.error(error)
        }
    }

    static async GetBlog (req, res){
        try {
            const query = `SELECT * from blog`
            const blog = await pool.query(query);
            if(!blog.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'your profile', blog.rowCount, blog.rows);
        }catch(error){
            console.log(error)
        }
    }

  
}

export default Controller;