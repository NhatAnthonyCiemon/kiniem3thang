import authRouter from "../app/auth/route.js";
import learnRouter from "../app/learn/route.js";

function route(app) {
    app.use("/user", authRouter);
    app.use("/learn", learnRouter);
    app.use((_, res) => {
        res.status(404).json({ error: "Not Found ::))))))))" });
    });
}

export default route;
