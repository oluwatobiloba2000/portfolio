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
        log(error(`Error From src/models/index.js - profileTable`))
        console.log(e)
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
        log(error(`Error From src/models/index.js - skillsTable`))
         console.log(e)
    }
}

const blogTable = async () => {
    const queryBlog = ` CREATE TABLE IF NOT EXISTS
    blog(
        id VARCHAR NOT NULL UNIQUE,
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
        log(error(`Error From src/models/index.js - blogTable`))
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
        log(error(`Error From src/models/index.js - projectTable`))
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
        log(`${chalk.keyword('orange')('contact me table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - contactMeTable`))
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
        log(`${chalk.keyword('orange')('user table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - userTable`))
        console.log(e)
    }
}

const visitorTable = async () => {
    const queryVisitorTable = ` CREATE TABLE IF NOT EXISTS
    visitorTable(
                id VARCHAR NOT NULL,
                avatar VARCHAR,
                gender VARCHAR,
                email VARCHAR NOT NULL,
                username VARCHAR,
                PassPhase VARCHAR NOT NULL,
                timeCreated VARCHAR,
                timestamp TIMESTAMP,
                new VARCHAR DEFAULT 'true',
                used VARCHAR DEFAULT 'false')`
    try {
        await pool.query(queryVisitorTable);
        log(`${chalk.keyword('orange')('visitor table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - visitorTable`))
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
                timeRecieved VARCHAR NOT NULL,
                dateRecieved VARCHAR NOT NULL)`
    try {
        await pool.query(queryActivityTable);
        log(`${chalk.keyword('orange')('activity table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - activityTable`))
        console.log(e)
    }
}

const blogViewsTable = async () => {
    const queryBlogViews = ` CREATE TABLE IF NOT EXISTS
    blogviews(
                id VARCHAR NOT NULL,
                blogId VARCHAR NOT NULL,
                ip VARCHAR NOT NULL,
                FOREIGN KEY(blogId) REFERENCES blog(id) ON DELETE CASCADE ON UPDATE CASCADE)`
    try {
        await pool.query(queryBlogViews);
        log(`${chalk.keyword('orange')('blogViews table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - blogViewsTable`))
        console.log(e)
    }
}

const adminMessageTable = async () => {
    const queryBlogViews = ` CREATE TABLE IF NOT EXISTS
    adminMessage(
        messageId VARCHAR NOT NULL,
        sender VARCHAR,
        reciever VARCHAR,
        subject VARCHAR,
        time VARCHAR NOT NULL,
        date VARCHAR NOT NULL,
        message VARCHAR NOT NULL,
        draft VARCHAR DEFAULT 'false',
        sent VARCHAR DEFAULT 'false',
        timestamp TIMESTAMP)`
    try {
        await pool.query(queryBlogViews);
        log(`${chalk.keyword('orange')('adminMessage table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - adminMessageTable`))
        console.log(e)
    }
}

const pinBoardTable = async () => {
    const queryPinBoard = ` CREATE TABLE IF NOT EXISTS
    pinBoard(
        pinBoardId VARCHAR NOT NULL,
        title VARCHAR,
        body VARCHAR,
        dateTime VARCHAR,
        timestamp TIMESTAMP)`
    try {
        await pool.query(queryPinBoard);
        log(`${chalk.keyword('orange')('pin Board table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - pinBoardTable`))
        console.log(e)
    }
}


const resumeTable = async () => {
    const queryResumeTable = ` CREATE TABLE IF NOT EXISTS
    resume(
        id VARCHAR NOT NULL,
        title VARCHAR,
        startYear VARCHAR,
        endYear VARCHAR,
        category VARCHAR,
        timestamp VARCHAR NOT NULL,
        location VARCHAR NOT NULL,
        body VARCHAR NOT NULL)`
    try {
        await pool.query(queryResumeTable);
        log(`${chalk.keyword('orange')('resume table created')}`);
    } catch (e) {
        log(error(`Error From src/models/index.js - resumeTable`))
        console.log(e)
    }
}

const dropTable = async () => {
    try {
        const query = `DROP TABLE IF EXISTS resume`;
        await pool.query(query);
        log(`${chalk.keyword('red')(`table dropped`)}`);
      } catch (e) {
          pool.end();
        }
}

profileTable()
skillsTable()
blogTable()
projectTable()
contactMeTable()
userTable()
visitorTable()
activityTable()
blogViewsTable()
adminMessageTable()
pinBoardTable()
resumeTable()
// dropTable()


export default pool;