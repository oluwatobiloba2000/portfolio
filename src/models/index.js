import pg from "pg";
import chalk from 'chalk';
import dotenv from "dotenv";
import config from '../config/index';

const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;

 
dotenv.config();

let connectionString;
const environmentalVariableSwitch = process.env.NODE_ENV;

if(!process.env.DEV_USER) {
    log(error(`Error From src/models/index.js`), errorMessage(`Fill in your database details in your ${chalk.keyword('cyan')('.env')} file`))
}else if(!environmentalVariableSwitch){
    log(error(`Error From src/models/index.js`), errorMessage(`${chalk.keyword('cyan')('NODE_ENV in .env')} file needs either 'test' or 'production' or 'development'`))
}
else if (environmentalVariableSwitch == 'test') {
    connectionString = config['test'];
} else if (environmentalVariableSwitch == 'production') {
    connectionString = config['production'];
} else {
    connectionString = config['development'];
}

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
        log(`${chalk.keyword('orange')('profile table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - profileTable`), errorMessage({e}))
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
        log(`${chalk.keyword('orange')('skills table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - skillsTable`), errorMessage({e}))
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
        log(`${chalk.keyword('orange')('blog table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - blogTable`), errorMessage({e}))
    }
}

const projectTable = async () => {
    const queryProject = ` CREATE TABLE IF NOT EXISTS
        project(
            id VARCHAR NOT NULL,
            picture VARCHAR NOT NULL,
            hostedLink VARCHAR NOT NULL,
            githubLink VARCHAR NOT NULL,
            projectName VARCHAR NOT NULL,
            projectStatus VARCHAR NOT NULL,
            clientCompany VARCHAR,
            projectLeader VARCHAR,
            estimatedBudget VARCHAR,
            totalAmountSpent VARCHAR,
            estimatedProjectDuration VARCHAR,
            moreDetails VARCHAR NOT NULL,
            timestamp TIMESTAMP )`
            try {
        await pool.query(queryProject);
        log(`${chalk.keyword('orange')('project table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - projectTable`), errorMessage({e}))
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
        log(`${chalk.keyword('orange')('contact me table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - contactMeTable`), errorMessage({e}))
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
        log(`${chalk.keyword('orange')('user table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - userTable`), errorMessage({e}))
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
        log(`${chalk.keyword('orange')('visitor table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - visitorTable`), errorMessage({e}))
    }
}

const activityTable = async () => {
    const queryActivityTable = ` CREATE TABLE IF NOT EXISTS
    activity(
                id VARCHAR NOT NULL,
                read VARCHAR DEFAULT 'false',
                body VARCHAR NOT NULL,
                timestamp TIMESTAMP,
                timeRecieved VARCHAR NOT NULL,
                dateRecieved VARCHAR NOT NULL)`
    try {
        await pool.query(queryActivityTable);
        log(`${chalk.keyword('orange')('activity table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - activityTable`), errorMessage({e}))
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


log(chalk.keyword('orange')('Yay for orange colored text!'));
export default pool;