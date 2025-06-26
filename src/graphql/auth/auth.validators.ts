import { z } from "zod";

export const loginInputSchema = z.object({
  username: z.string().min(1, "Username is required"),
  plainTextPassword: z.string().min(1, "Password is required"),
});
