import pg from "pg";
import config from '../config/index';
import dotenv from "dotenv";

dotenv.config();

let connetionString;
const environmentalVariableSwitch = process.env.NODE_ENV;

if (environmentalVariableSwitch == 'test') {
    connectionString = config['test'].use_env_variable;
} else if (environmentalVariableSwitch == 'production') {
    connectionString = config['production'];
} else {
    connectionString = config['development'];
}

const pool = new pg.pool(
    connectionString
);

pool.on('connect', ()=>{})

const profileTable = async () =>{
   const queryProfile = ` CREATE TABLE IF NOT EXISTS
   profile(name NVARCHAR NOT NULL,
    about NVARCHAR NOT NULL,
    profilePics NVARCHAR,
    backgroundPics NVARCHAR,
    birthday NVARCHAR,
    phoneNumber INT,
    cvLink NVARCHAR,
    dateLunched NVARCHAR)`
    try{
        await pool.query(queryProfile);
    }catch(e){
        console.log(e);
    }
}

profileTable()