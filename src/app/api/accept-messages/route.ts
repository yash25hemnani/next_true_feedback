import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
    // Here we are updating the user's accept messages field
    await dbConnect()

    // Here we are getting the session and extracting the user which we added to it in callbacks of options.ts
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "User not authenticated."
        }, { status: 401 })
    }

    const userId = user._id
    const { acceptMessages } = await request.json()

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            { new: true }
        )

        if (!updatedUser) {
            return NextResponse.json({
                success: false,
                message: "Failed to update user status"
            }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            message: "Message acceptance status updated successfully.",
            updatedUser
        }, { status: 200 })

    } catch (error) {
        console.log("Failed to update user status: ", error);
        return NextResponse.json({
            success: false,
            message: "Server Error"
        }, { status: 500 })
    }

}

export async function GET(request: NextRequest) { 
    // Here we are updating the user's accept messages field
    await dbConnect()

    // Here we are getting the session and extracting the user which we added to it in callbacks of options.ts
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "User not authenticated."
        }, { status: 401 })
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            return NextResponse.json({
                success: false,
                message: "Failed to find user"
            }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            isAcceptingMessages: foundUser.isAcceptingMessage

        }, { status: 200 })
    } catch (error) {
        console.log("Failed to GET data: ", error);
        return NextResponse.json({
            success: false,
            message: "Server Error"
        }, { status: 500 })
    }
}