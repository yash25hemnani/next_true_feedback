import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { z } from "zod"
import { usernameValidation } from "@/schemas/signUpSchema";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";

// First we create the query schema
const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {

    await dbConnect();

    try {
        // http://localhost:3000/api/check-username-unique?username=hitesh
        const { searchParams } = new URL(request.url)
        const queryParams = {
            username: searchParams.get('username')
        }

        // Validate with zod, the passed value should be an object
        const result = UsernameQuerySchema.safeParse(queryParams)
        console.log(result);

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [] // Since result.error has all the errors, we use this to get only username realted errors

            return NextResponse.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : 'Invalid Query Parameters'
            }, { status: 400 })
        }

        const { username } = result.data

        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        if (existingVerifiedUser) {
            return NextResponse.json({
                success: false,
                message: "Username is already taken."
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            message: "Username is available."
        }, { status: 200 })

    } catch (error) {
        console.log("Error checking username", error);
        return NextResponse.json({
            success: false,
            message: "Error registring user."
        }, { status: 500 })
    }

}   
