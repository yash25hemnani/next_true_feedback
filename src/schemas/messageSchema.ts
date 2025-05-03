import { z } from "zod";

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, { message: "Content must be atleast of 10 characters" })
        .max(300, { message: "Content must be at most of 300 characters" })
})