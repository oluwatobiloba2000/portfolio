import jwt from 'jsonwebtoken';
import chalk from 'chalk';
import pool from '../models/index';
import dotenv from 'dotenv';
import jsonFormatter from '../helpers/jsonFormat';
import cloudinary from 'cloudinary';
dotenv.config();

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;

class Controller{
    static async upLoadphoto (req, res){
        const image = req.files.image;
        const imageTag = req.body.imageTag; // either porfile or background or blog
        jwt.verify(req.token, process.env.SPECIAL_PIN_KEY, async (err, authorizedData)=>{
            console.log(image)
            if(err){
                return res.status(403).json(err)
              }else{
            if(!image || !imageTag){
                return jsonFormatter.error(res, 'All fields are required !', 400, undefined, undefined, 'fields required');
            }
            try {
                // return console.log("name" , image.name ,"size",formatBytes(image.size, 3))
                const imageSize = formatBytes(image.size, 3)
                cloudinary.v2.uploader.upload(image.tempFilePath, { resourse_type: 'auto' })
                .then(async (result) => {
                    if(!result) return jsonFormatter.error(res, 'upload error', undefined, undefined, 'error');
                    // image response

                        //save the photo in the database photouploads
                        const saveUpload = `INSERT INTO photoUploads (imageId, imageLink, imageSize , imageName, timestamp, imageTag, imageFormat, imageWidth, imageHeight) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
                        const values = [result.public_id, result.secure_url, imageSize , image.name, result.created_at, imageTag, result.format, result.width, result.height];
                        const imageSaved = await pool.query(saveUpload, values);

                   return  jsonFormatter.success(res, 'image uploaded successfully and saved',imageSaved.rows, result, undefined, 'uploaded');
                })
                .catch((err) =>
                  log(error('Error from : src/contollers/puploadPhoto.js - uploadphoto'), errorMessage(err))
                )

            }catch(err){
                log(error('Error from : src/contollers/profileController.js - uploadPhoto'), errorMessage(err));
            }}})
        }
        
            //this is an open route
    static async getUploadedPics (req, res){
        const start = parseInt(req.query.start);
        const count = parseInt(req.query.count);
        try {
            const query = `SELECT * from photoUploads ORDER BY TIMESTAMP OFFSET($1) LIMIT($2)`
            const values = [start, count]
            const photos = await pool.query(query, values);
            if(!photos.rows.length) return jsonFormatter.success(res, 'empty');
            return jsonFormatter.success(res, 'All pics', photos.rowCount, photos.rows, undefined, 'all');
        }catch(err){
            log(error('Error from : src/contollers/blogController.js - getUploadedPics'), errorMessage(err));
        }
    }

}
    
    //    cloudinary.uploader.upload("sample.jpg", {"crop":"limit","tags":"samples","width":3000,"height":2000},
        // function(result) { console.log(result) });
// static async GetPhotoByTag (req, res){
//     try {
//   cloudinary.image("sample", {"crop":"fill","gravity":"faces","width":300,"height":200,"format":"jpg"});
//     }catch(err){
//         log(error('Error from : src/contollers/profileController.js - Getprofile'), errorMessage(err));
//     }
// }
    //CLOUDINARY RESPONSE IS EXACTLY LIKE THIS
    // {
//     "status": "success",
//     "description": "image uploaded successfully",
//     "data": {
//         "public_id": "b1i73wy9qdgxhtknoejr",
//         "version": 1587829868,
//         "signature": "501de660e178c8c10ae901f25b7ff63dabf89394",
//         "width": 1366,
//         "height": 768,
//         "format": "png",
//         "resource_type": "image",
//         "created_at": "2020-04-25T15:51:08Z",
//         "tags": [],
//         "bytes": 1114443,
//         "type": "upload",
//         "etag": "a12c5e803b55c7123bd7564610509aab",
//         "placeholder": false,
//         "url": "http://res.cloudinary.com/tobby-portfolio/image/upload/v1587829868/b1i73wy9qdgxhtknoejr.png",
//         "secure_url": "https://res.cloudinary.com/tobby-portfolio/image/upload/v1587829868/b1i73wy9qdgxhtknoejr.png",
//         "original_filename": "tmp-1-1587829853557"
//     },
//     "action": "uploaded"
// }

//WHEN YOU PREVIEW IT TO THE CLIENT, SHOW THE SIZE
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default Controller;