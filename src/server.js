//import express
import express from "express";

// import body parser
import bodyParser from "body-parser";

// import cors
import cors from "cors";

// import routes
import appRouter from "./routes";

//initialize express
const app = express();
app.use(cors());

app.use(bodyParser.json({
    extended: true
}))

app.use(appRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, ()=>{
    console.log(`app is listening on port localhost:${PORT}`)
})

//exporting app for testing purposes
export default app;