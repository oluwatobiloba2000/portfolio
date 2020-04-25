import dotenv from "dotenv";
import cloudinary from 'cloudinary';
dotenv.config();

module.exports = {
    development: {
       user: process.env.DEV_USER,
       password: process.env.DEV_PASSWORD,
       server: process.env.DEV_SERVER,
       port: process.env.DEV_PORT,
       database: process.env.DEV_DATABASE
    },
    test: {
        // use_env_variable:process.env.TEST_DB_URL,
        user: process.env.TEST_USER,
        password: process.env.TEST_PASSWORD,
        server: process.env.TEST_SERVER,
        port: process.env.TEST_PORT,
        database: process.env.TEST_DATABASE
    },
    production:{
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        server: process.env.DB_SERVER,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE
    }
}


// cloudinary config
export default cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});