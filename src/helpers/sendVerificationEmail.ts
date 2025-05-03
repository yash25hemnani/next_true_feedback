import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    // Now that we have defined the type as ApiResponse, we will be forced to send a specific type of data always. This is good for type safety.
    try {
        await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: email,
            subject: 'Verification Code',
            react: VerificationEmail({ username, otp: verifyCode })
        })

        return { success: true, message: 'Verification email send successfully.' }

    } catch (emailError) {
        console.error("Error sending verification email: ", emailError);

        return { success: false, message: 'Failed to send verification email' }
    }
}

