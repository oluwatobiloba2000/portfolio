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

    static async updateBlog(req, res){
        const id = req.params.id;

        try{
            const query = `SELECT * FROM blog WHERE id=$1`
            const value = [id];
            const formerBlog = await pool.query(query, value);
            if(!formerBlog.rows.length) return jsonFormatter.error(res, 'blog not found', 404)
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
            return jsonFormatter.success(res, 'blog updated', newBlog.rowCount, newBlog.rows);
        }catch(e){
            console.error(e)
        }
    }
}

export default Controller;