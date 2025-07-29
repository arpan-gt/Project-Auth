import { signUpSchema } from "../schemas/userSchema.js"
import { User } from "../models/User.models.js";


//signup 
const signUp = async (req, res) => {
  try {
    const result = signUpSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json(
        {
          message: "validation failed"
        })
    }

    const { email, userName, password } = result.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(
        {
          message: "user already exists with this email"
        })
    }


    const user = await User.create(
      {
        email,
        userName,
        password
      });

    return res.status(200).json(
      {
        message: "user signedUp successfully",
        user: {
          id: user._id,
          email: user.email
        }
      })

  } catch (err) {
    console.error("Error in signUp:", err);
    return res.status(500).json(
      {
        message: "Internal server error"
      });
  }
}


const signIn = async(req, res)=>{
  
}
export { signUp }
