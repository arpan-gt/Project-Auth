import { loginSchema, registerSchema } from "../schemas/userSchema.js";
import { User } from "../models/User.models.js";
import { treeifyError } from "zod";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

//register
const register = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);

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
      text: `Hello ${user.userName},\nPlease verify your email by clicking the link below:\n${process.env.BASE_URL}/verify-email/${token}\nThis link will expire in 15 minutes.`,
      html: `
          <h2>Email Verification</h2>
          <p>Hello ${user.userName},</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${process.env.BASE_URL}/verify-email/${token}">Verify Email</a>
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

// verify email
const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        message: "Verification token is required",
      });
    }

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired verification token",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// login
const login = async (req, res) => {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: treeifyError(result.error),
    });
  }

  const { email, password } = result.data;
  try {
    const existingUser = await User.findOne({ email }).select("+password");
    if (!existingUser) {
      return res.status(400).json({
        message: "Email not registered",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    const isVerified = existingUser.isVerified;
    if (!isVerified) {
      return res.status(403).json({
        message: "Please verify your email",
      });
    }

    const token = jwt.sign(
      { id: existingUser._id },
      process.env.JWT_USER_SECRET,
      {
        expiresIn: "24h",
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    };
    res.cookie("access_token", token, cookieOptions);

    return res.status(200).json({
      message: "Login successfully",
      user: {
        id: existingUser._id,
        name: existingUser.userName,
        token,
      },
    });
  } catch (err) {
    console.log("Login error", err);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

//profile
const profile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("error ", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//logout
const logout = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    console.log("error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//forgotPassword
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 min expiry
    await user.save();

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      secure: false,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        pass: process.env.MAILTRAP_PASSWORD,
      },
    });

    const resetUrl = `${process.env.BASE_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.MAILTRAP_SENDEREMAIL,
      to: email,
      subject: "Reset Your Password",
      html: `
        <h2>Password Reset</h2>
        <p>Hello ${user.userName},</p>
        <p>Click the link below to reset your password. This link is valid for 15 minutes.</p>
        <a href="${resetUrl}">Reset Password</a>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset email sent",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//reserPassword
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export {
  register,
  verifyUser,
  login,
  profile,
  forgotPassword,
  resetPassword,
  logout,
};
