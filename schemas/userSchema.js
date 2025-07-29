import { z } from 'zod';

const signUpSchema = z.object({
  userName: z.string(),
  email: z.email(),
  password: z.string()
})

const signInSchema = z.object({
  email: z.email(),
  password: z.string()
})
export { signUpSchema,signInSchema }