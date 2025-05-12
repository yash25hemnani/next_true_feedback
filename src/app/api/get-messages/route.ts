import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";
import { User } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types/ApiResponse";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
    await dbConnect();

    // Here we are getting the session and extracting the user which we added to it in callbacks of options.ts
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User

    if (!session || !session.user) {
        return NextResponse.json({
            success: false,
            message: "User not authenticated."
        }, { status: 401 })
    }

    // const userId = user._id; // This was converted to string, in our token. // This would work in findById and all but not aggregation pipeline.

    const userId = new mongoose.Types.ObjectId(user._id)

    try {
        const user = await UserModel.aggregate([
            { $match: { id: userId } },
            { $unwind: '$messages' }, // Converts the array to documents, each other id and user data
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } } // An object is created with ID and sorted messages.
        ])

        if (!user || user.length === 0) {
            return NextResponse.json({
                success: false,
                message: "User not found"
            }, { status: 401 })
        }

        return NextResponse.json({
            success: true,
            messages: user[0].messages
        }, { status: 200 })

    } catch (error) {

    }

}