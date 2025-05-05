// Algorithm we will follow - 
// IF existingUserByEmail EXISTS THEN
//    IF existingUserByEmail.isVerified THEN
//        success: false --> Means user exists and is verified
//    ELSE
//       // Save the updated user 
// ELSE
//    // Create a new user with provided details
//    // Save the new user
// END IF

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    // We have defined the NextResponse to follow the ApiResponse type
    await dbConnect();

    try {
        // Whenever you are getting request.json you must always await
        const { username, email, password } = await request.json()

        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true
        })

        if (existingUserVerifiedByUsername) {
            return NextResponse.json({
                success: false,
                message: "Username already taken."
            }, { status: 400 })
        }

        const existingUserByEmail = await UserModel.findOne({ email })

        const verifyCode = Math.floor(100000 + Math.random() * 90000).toString();

        if (existingUserByEmail) {
            // The user exists with this email
            if (existingUserByEmail.isVerified) {
                // If the existing user is already verified, then we can return.
                return NextResponse.json({
                    success: false,
                    message: "User already exists with this email."
                }, { status: 400 })
            } else {
                // If the existing user is not verified but exists, then we can save the new password they give and send a new verification code.
                const hashedPassword = await bcrypt.hash(password, 10)

                existingUserByEmail.password = hashedPassword;

                existingUserByEmail.verifyCode = verifyCode;

                const expiryDate = new Date()
                expiryDate.setHours(expiryDate.getHours() + 1)

                existingUserByEmail.verifyCodeExpiry = expiryDate;

                await existingUserByEmail.save()
            }
        } else {
            // If the user doesn't exist, we create a new one.
            const hashedPassword = await bcrypt.hash(password, 10);

            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        // Send verification email weather the user is a new one or was existing but not verified.
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if (!emailResponse.success) {
            return NextResponse.json({
                success: false,
                message: emailResponse.message
            }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: "User Registered Successfully! Please verify email"
        }, { status: 200 })

    } catch (error) {
        console.error("Error registring error: ", error);
        return NextResponse.json({
            success: false,
            message: "Error registring user."
        }, { status: 500 })

    }
}