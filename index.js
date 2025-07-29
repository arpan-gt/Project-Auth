import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './utils/db.js';
import { userRouter } from './routes/user.routes.js';
const app = express();
dotenv.config();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.use("/api/v1/user", userRouter);


app.listen(PORT, () => {
  console.log(`listening to PORT ${PORT}`);
})