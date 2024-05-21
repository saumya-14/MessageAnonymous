import {z} from "zod"

export const MessageSchema = z.object({
   content:z
   .string()
   .min(10,{message:"Content must be atleast of 10 character"})
    .max(300,{message:"Content mustg be no longer then 300 characters"})
   
})