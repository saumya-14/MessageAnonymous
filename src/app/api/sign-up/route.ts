import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import dbConnect from "@/lib/dbConnect";

import UserModel from "@/models/User";
import bcrypt from 'bcryptjs'

export async function POST(request:Request){
    await dbConnect()
    try{
      const {username,email,password} = await request.json()
      const existingUserVerificationByUsername = await UserModel.findOne({
        username,
        isVerified:true
      })

      if(existingUserVerificationByUsername){
           return Response.json({
              success:false,
              message:"Username is already taken"
           },{status:400})
      }

     const existingUserByemail= await UserModel.findOne({email})
     const verifyCode= Math.floor(10000+Math.random()*900000).toString()

     if(existingUserByemail){
        if(existingUserByemail.isVerified){
            return Response.json({
                success:false,
                message:"User alreday exist with this emmail"
          
              },{status:500}
          
              )
        }
        else{
            const hashedPassword= await bcrypt.hash(password,10)
            existingUserByemail.password= hashedPassword;
            existingUserByemail.verifyCode= verifyCode;
            existingUserByemail.verifyCodeExpire=new Date(Date.now()+3600000)
            await existingUserByemail.save()
        }

     }
     else{
        const hashedPassword = await bcrypt.hash(password,10)
        const expiryDate= new Date()
        expiryDate.setHours(expiryDate.getHours() + 1)

        const newUser=new UserModel({
            username,
            email,
            password:hashedPassword,
            verifyCode,
            verifyCodeExpire:expiryDate,
            isVerified:false,
            isAcceptingMessage:true,
            message:[]
        })

        await newUser.save();
     }
   

     const emailResponse=await sendVerificationEmail(
        email,
        username,
        verifyCode
     )
   if(!emailResponse.success){
    return Response.json({
      success:false,
      message:emailResponse.message

    },{status:500}

    )

   }
   return Response.json({
    success:true,
    message:"User registered successfully"

  },{status:201})

    }catch(error){
        console.error('Error registering user',error)
        return Response.json({
            success:false,
            message:"Error registering user"
        },{
            status:500
        })
    }
}
