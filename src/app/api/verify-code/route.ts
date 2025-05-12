import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { z } from "zod"
import { verifySchema } from "@/schemas/verifySchema";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
    await dbConnect()
    try {
        const { username, code } = await request.json()
        const decodedUsername = decodeURIComponent(username)

        const user = await UserModel.findOne({ username: decodedUsername })

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found."
            }, { status: 500 })
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()

            return NextResponse.json({
                success: true,
                message: "Account verified successfully."
            }, { status: 200 })
        } else if (!isCodeNotExpired) {
            return NextResponse.json({
                success: false,
                message: "Verification code is expired, please signup again to get a new code."
            }, { status: 400 })
        } else {
            // Is code is wrong
            return NextResponse.json({
                success: false,
                message: "Incorrect verification code"
            }, { status: 400 })
        }

    } catch (error) {
        console.log("Error verifying user", error);
        return NextResponse.json({
            success: false,
            message: "Error verifying user."
        }, { status: 500 })
    }
}