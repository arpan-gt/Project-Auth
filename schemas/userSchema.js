import { z } from "zod";

const registerSchema = z.object({
  userName: z.string().min(3, "Username must be atleast 3 characters long"),
  email: z.email("Enter valid email"),
  password: z.string().min(6, "Password must be atleast 6 characters long"),
});

const loginSchema = z.object({
  email: z.email("Enter valid email"),
  password: z.string().min(1, "Invalid credentials"),
});
export { registerSchema, loginSchema };
