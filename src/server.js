//import express
import express from "express";

// import body parser
import bodyParser from "body-parser";

// import cors
import cors from "cors";

import chalk from 'chalk';

// import routes
import appRouter from "./routes";

//initialize express
const app = express();
app.use(cors());

app.use(bodyParser.json({
    extended: true
}))

app.use(appRouter);
const log = console.log;
const error = chalk.bold.red.inverse.bgWhite;
const errorMessage = chalk.white.bgGrey;
const success = chalk.bold.black.bgGreen;
const successMessage = chalk.green;
const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    log(success('From server.js'), successMessage(`You can now view the app in your browser ${chalk.keyword('white')(`http://localhost:${PORT}`)}`))
})

//exporting app for testing purposes
export default app;