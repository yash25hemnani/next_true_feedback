import { z } from "zod";

export const verifySchema = z.object({
    email: z.string(),
    password: z.string()
})
