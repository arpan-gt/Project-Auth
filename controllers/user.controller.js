import { signInSchema, signUpSchema } from "../schemas/userSchema.js";
import { User } from "../models/User.models.js";
import { treeifyError } from "zod";

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


export { register };
