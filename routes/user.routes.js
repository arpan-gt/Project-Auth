import express from "express";
const userRouter = express.Router();
import {
  forgotPassword,
  login,
  logout,
  profile,
  register,
  resetPassword,
  verifyUser,
} from "../controllers/user.controller.js";
import { isLoggedIn } from "../middlewares/auth.middleware.js";

userRouter.post("/register", register);
userRouter.get("/verify-email/:token", verifyUser);
userRouter.post("/login", login);
userRouter.get("/profile", isLoggedIn, profile);
userRouter.post("/logout", isLoggedIn, logout);
userRouter.post("/forgotPassword", forgotPassword);
userRouter.post("/resetPassword/:token", resetPassword);

export { userRouter };
