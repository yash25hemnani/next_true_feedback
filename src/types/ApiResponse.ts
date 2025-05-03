import { Message } from "@/model/user.model";

// We generally use interfaces for creating types
export interface ApiResponse {
    success: boolean,
    message: string,
    isAcceptingMessages?: boolean, // the ? makes it optional
    messages?: Array<Message>
}

