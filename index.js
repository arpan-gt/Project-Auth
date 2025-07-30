import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./utils/db.js";
import { userRouter } from "./routes/user.routes.js";

const app = express();
dotenv.config();

const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

connectDB();

app.use("/api/v1/user", userRouter);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("Malformed JSON:", err.message);
    return res.status(400).json({ message: "Invalid JSON payload" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
