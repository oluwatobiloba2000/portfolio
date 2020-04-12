import pg from "pg";
import config from '../config/index';
import dotenv from "dotenv";

dotenv.config();

let connectionString;
const environmentalVariableSwitch = process.env.NODE_ENV;

if (environmentalVariableSwitch == 'test') {
    connectionString = config['test'].use_env_variable;
} else if (environmentalVariableSwitch == 'production') {
    connectionString = config['production'];
} else {
    connectionString = config['development'];
}

console.log(connectionString)
const pool = new pg.Pool(connectionString);

pool.on('connect', () => {})

const profileTable = async () => {
    const queryProfile = ` CREATE TABLE IF NOT EXISTS
   profile(name VARCHAR NOT NULL,
    about VARCHAR NOT NULL,
    profilePics VARCHAR(5000),
    backgroundPics VARCHAR(5000),
    birthday VARCHAR(5000),
    phoneNumber VARCHAR,
    cvLink VARCHAR(5000),
    dateLunched VARCHAR(5000),
    lastLogout VARCHAR,
    id SERIAL PRIMARY KEY UNIQUE)`
    try {
        await pool.query(queryProfile);
        console.log('1. profile table created');
    } catch (e) {
        console.log(e);
    }
}

const socialTable = async () => {
    const querySocial = ` CREATE TABLE IF NOT EXISTS
    social(
        id SERIAL PRIMARY KEY UNIQUE,
        iconCode VARCHAR(5000),
        name VARCHAR(5000),
        link VARCHAR(5000))`
    try {
        await pool.query(querySocial);
        console.log('2. social table created');
    } catch (e) {
        console.log(e)
    }
}

const skillsTable = async () => {
    const querySkills = ` CREATE TABLE IF NOT EXISTS
    skills(
        id SERIAL PRIMARY KEY UNIQUE,
            Name VARCHAR(5000),
            SkillsPics VARCHAR(5000),
            skillLinkWebsite VARCHAR(5000),
            timestamp TIMESTAMP)`
    try {
        await pool.query(querySkills);
        console.log('3. skills table created');
    } catch (e) {
        console.log(e)
    }
}

const blogTable = async () => {
    const queryBlog = ` CREATE TABLE IF NOT EXISTS
    blog(
        id SERIAL PRIMARY KEY UNIQUE,
        title VARCHAR NOT NULL,
        category VARCHAR NOT NULL,
        picture VARCHAR NOT NULL,
        date VARCHAR NOT NULL,
        time VARCHAR NOT NULL,
        story VARCHAR NOT NULL,
        updated VARCHAR DEFAULT false,
        timestamp TIMESTAMP )`
    try {
        await pool.query(queryBlog);
        console.log('4. blog table created');
    } catch (e) {
        console.log(e)
    }
}

const projectTable = async () => {
    const queryProject = ` CREATE TABLE IF NOT EXISTS
        project(
            id SERIAL PRIMARY KEY UNIQUE,
            picture VARCHAR NOT NULL,
            hostedLink VARCHAR NOT NULL,
            githubLink VARCHAR NOT NULL,
            moreDetails VARCHAR NOT NULL,
            timestamp TIMESTAMP )`
    try {
        await pool.query(queryProject);
        console.log('5. project table created');
    } catch (e) {
        console.log(e)
    }
}

const contactMeTable = async () => {
    const queryContactMe = ` CREATE TABLE IF NOT EXISTS
            contactMe(
                id SERIAL PRIMARY KEY UNIQUE,
                name VARCHAR NOT NULL,
                message VARCHAR NOT NULL,
                read VARCHAR DEFAULT 'false',
                subject VARCHAR NOT NULL,
                senderEmailAddress VARCHAR NOT NULL,
                timeReceived VARCHAR NOT NULL,
                star VARCHAR DEFAULT 'false',
                trash VARCHAR DEFAULT 'false',
                timestamp TIMESTAMP )`
    try {
        await pool.query(queryContactMe);
        console.log('6. contact me table created');
    } catch (e) {
        console.log(e)
    }
}

const userTable = async () => {
    const queryUserTable = ` CREATE TABLE IF NOT EXISTS
            project(
                id SERIAL PRIMARY KEY UNIQUE,
                emailaddress VARCHAR NOT NULL,
                username VARCHAR NOT NULL,
                password VARCHAR NOT NULL,
                whatsappPin VARCHAR NOT NULL)`
    try {
        await pool.query(queryUserTable);
        console.log('7. user table created');
        console.log(`----------------Table creation successful-----------------`)
    } catch (e) {
        console.log(e)
    }
}

const dropTable = async () => {
    try {
        const query = "DROP TABLE IF EXISTS contactMe";
        await pool.query(query);
        console.log("Table dropped");
      } catch (e) {
        pool.end();
      }
}

profileTable()
// dropTable()
socialTable()
skillsTable()
blogTable()
projectTable()
contactMeTable()
userTable()
export default pool;