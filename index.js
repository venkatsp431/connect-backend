import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import createConnection from "./db.js";
import { userRouter } from "./Routes/user.js";
import { messageRouter } from "./Routes/message.js";
// import userRouter from "./Routes/user.js";

dotenv.config();
createConnection();
const PORT = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/chat", messageRouter);

app.listen(PORT, () => console.log(`Server running in localhost:${PORT}`));
