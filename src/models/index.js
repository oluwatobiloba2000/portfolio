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
        console.log('profile table created');
    } catch (e) {
        console.log(e);
    }
}

const skillsTable = async () => {
    const querySkills = ` CREATE TABLE IF NOT EXISTS
    skills(
        id VARCHAR NOT NULL,
            Name VARCHAR(5000),
            SkillsPics VARCHAR(5000),
            skillLinkWebsite VARCHAR(5000),
            timestamp TIMESTAMP)`
    try {
        await pool.query(querySkills);
        console.log('skills table created');
    } catch (e) {
        console.log(e)
    }
}

const blogTable = async () => {
    const queryBlog = ` CREATE TABLE IF NOT EXISTS
    blog(
        id VARCHAR NOT NULL,
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
        console.log('blog table created');
    } catch (e) {
        console.log(e)
    }
}

const projectTable = async () => {
    const queryProject = ` CREATE TABLE IF NOT EXISTS
        project(
            id VARCHAR NOT NULL,
            picture VARCHAR NOT NULL,
            hostedLink VARCHAR NOT NULL,
            githubLink VARCHAR NOT NULL,
            moreDetails VARCHAR NOT NULL,
            timestamp TIMESTAMP )`
    try {
        await pool.query(queryProject);
        console.log('project table created');
    } catch (e) {
        console.log(e)
    }
}

const contactMeTable = async () => {
    const queryContactMe = ` CREATE TABLE IF NOT EXISTS
            contactMe(
                id VARCHAR NOT NULL,
                name VARCHAR NOT NULL,
                message VARCHAR NOT NULL,
                read VARCHAR DEFAULT 'false',
                subject VARCHAR NOT NULL,
                senderEmailAddress VARCHAR NOT NULL,
                timeReceived VARCHAR NOT NULL,
                star VARCHAR DEFAULT 'false',
                trash VARCHAR DEFAULT 'false',
                timeTrashed VARCHAR,
                timestamp TIMESTAMP )`
    try {
        await pool.query(queryContactMe);
        console.log('contact me table created');
    } catch (e) {
        console.log(e)
    }
}

const userTable = async () => {
    const queryUserTable = ` CREATE TABLE IF NOT EXISTS
            userDetails(
                id VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                username VARCHAR NOT NULL,
                password VARCHAR NOT NULL,
                specialPin VARCHAR NOT NULL)`
    try {
        await pool.query(queryUserTable);
        console.log('user table created');
    } catch (e) {
        console.log(e)
    }
}

const visitorTable = async () => {
    const queryVisitorTable = ` CREATE TABLE IF NOT EXISTS
            visitorTable(
                id VARCHAR NOT NULL,
                email VARCHAR NOT NULL,
                username VARCHAR,
                PassPhase VARCHAR NOT NULL,
                timeCreated VARCHAR,
                timestamp TIMESTAMP,
                used VARCHAR DEFAULT 'false')`
    try {
        await pool.query(queryVisitorTable);
        console.log('visitor table created');
    } catch (e) {
        console.log(e)
    }
}

const activityTable = async () => {
    const queryActivityTable = ` CREATE TABLE IF NOT EXISTS
            activity(
                id VARCHAR NOT NULL,
                read VARCHAR DEFAULT 'false',
                body VARCHAR NOT NULL,
                timestamp TIMESTAMP,
                timeRecieved VARCHAR NOT NULL)`
    try {
        await pool.query(queryActivityTable);
        console.log('activity table created');
    } catch (e) {
        console.log(e)
    }
}
const dropTable = async () => {
    try {
        const query = "DROP TABLE IF EXISTS activity";
        await pool.query(query);
        console.log("Table dropped");
      } catch (e) {
        pool.end();
      }
}

profileTable()
// dropTable()
skillsTable()
blogTable()
projectTable()
contactMeTable()
userTable()
visitorTable()
activityTable()
export default pool;