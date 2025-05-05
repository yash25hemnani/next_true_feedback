'use client'
import { useSession, signIn, signOut } from "next-auth/react"

function page() {
  const { data: session } = useSession()

  if (session) {
    return (
      <>
        Signed in as {session.user.email}
        <button onClick={() => signOut()}>
          Logout
        </button>
      </>
    )
  }

  return (
    <>
      Not signed in
      <button onClick={() => signIn()}>
        Sign In
      </button>
    </>

  )
}

export default page