import express from "express";
const userRouter=express.Router();
import {signUp} from "../controllers/user.controller.js"

userRouter.post("/signup",signUp)

export {userRouter}
