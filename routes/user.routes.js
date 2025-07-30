import express from "express";
const userRouter = express.Router();
import { login, register, verifyUser } from "../controllers/user.controller.js";

userRouter.post("/register", register);
userRouter.get("/verify-email/:token", verifyUser);
userRouter.post("/login", login);

export { userRouter };
