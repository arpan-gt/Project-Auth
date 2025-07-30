import { signInSchema, signUpSchema } from "../schemas/userSchema.js";
import { User } from "../models/User.models.js";
import { treeifyError } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";

//register
const register = async (req, res) => {
  try {
    const result = signUpSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "validation failed",
        errors: treeifyError(result.error),
      });
    }

    const { email, userName, password } = result.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "user already exists with this email",
      });
    }

    const user = await User.create({
      email,
      userName,
      password,
    });

    if (!user) {
      return res.status(400).json({
        message: "User not registered",
      });
    }
    console.log(user);

    const token = crypto.randomBytes(32).toString("hex");
    console.log(token);
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    //send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: user.email,
      subject: "verify your email",
      text: "Hello world?",
      html: `
          <h2>Email Verification</h2>
          <p>Hello ${user.userName},</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${process.env.CLIENT_URL}/verify-email?token=${token}">Verify Email</a>
          <p>This link will expire in 15 minutes.</p>
        `,
    });

    console.log("Message sent:", info.messageId);

    return res.status(200).json({
      message: "user registered successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Error in register:", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};



export { register, verifyEmail };
