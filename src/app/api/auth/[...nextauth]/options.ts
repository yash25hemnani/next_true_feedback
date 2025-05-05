import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/user.model";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier.email },
                            { username: credentials.identifier.username },
                        ]
                    })

                    // In NextAuth either you return the User or the error or null

                    if (!user) {
                        throw new Error('No user found with this email')
                    }

                    if (!user.isVerified) {
                        throw new Error('Please verify your account first')
                    }
                    // Here we have to use credentials.password and not credentials.identifier.password ==> it is an inconsistency
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)

                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error('Incorrect password')
                    }

                } catch (error: any) {

                    throw new Error(error);
                }
            }
        })
    ],
    // Callbacks ==> In the documentation we have some pre defined callbacks and what they will return, make sure to adhere to that.
    callbacks: {
        // This 'user' is returned from providers
        async jwt({ token, user }) {
            // This 'token' only has userId, we will add more data to it.

            if (user) {
                // You can not add these fields to the token directly, since the user is defined differently, this is why we will be changing the default structure of user ==> defined in next-auth.d.ts
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username

            }
            return token
        },
        
        async session({ session, token }) {
            // Here also we will have to redeine the structure of session.user
            if(token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
    },

    pages: {
        // signIn: '/auth/signin' ==> We have this by defualt and we can overwrite it
        signIn: '/signin'
    },
    session: {
        strategy: 'jwt'
    },
    secret: process.env.NEXTAUTH_SECRET,

}