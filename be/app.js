import express from "express";
import route from "./src/routers/index.js";
import dotenv from "dotenv";
import cors from "cors";
import passport from "./src/config/passport.js";

dotenv.config();

const app = express();
app.use(passport.initialize());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

route(app);

//Middleware handle errors
app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running at http://localhost:${process.env.PORT}`);
});

export default app;
