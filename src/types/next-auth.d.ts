import "next-auth"
import { DefaultSession } from "next-auth"

// We are redefining the structure of User and Session
declare module "next-auth" {
    interface User {
        _id?: string,
        isVerified?: boolean,
        isAcceptingMessages?: boolean,
        username?: string,
    }

    interface Session {
        user: {
            _id?: string,
            isVerified?: boolean,
            isAcceptingMessages?: boolean,
            username?: string,
        } & DefaultSession['user'] // This says there will be key called 'user' in DefaultSession no matter the data.
    }
}

// We can also redefine like this instead of following the upper method
declare module 'next-auth/jwt' {
    interface JWT {
        _id?: string,
        isVerified?: boolean,
        isAcceptingMessages?: boolean,
        username?: string,
    }
}