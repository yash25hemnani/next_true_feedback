'use client'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link"
import axios, { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { useDebounceCallback, useDebounceValue } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/compat/router"
import { signUpSchema } from "@/schemas/signUpSchema"
import { ApiResponse } from "@/types/ApiResponse"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2 } from 'lucide-react';


function page() {
  // First we will be creating the username field, which will check the existence of the input username regularly, we will use debouncing here.
  const [username, setUsername] = useState('')
  // This is for the message about existence the backend will return.
  const [usernameMessage, setUsernameMessage] = useState('')
  // For the loaded
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  // For form submission
  const [isSubmitting, setIsSubmitting] = useState(false)

  // For debouncing, we will be using a third party library hook called - useDebounceCallback from usehooks-ts
  // If we used useDebounceCallback, we would have callback as the input
  // username will set after 300
  const debounced = useDebounceCallback(setUsername, 300)

  const router = useRouter()

  // ZOD Implementation
  // This variable can be differently named accross documentations, some call it register as well
  const form = useForm({
    // This defines the kind of resolver
    resolver: zodResolver(signUpSchema),
    // This defines the default form values, they can be empty or hold a value
    defaultValues: {
      username: '',
      email: '',
      password: ''
    }
  })

  // We will be sending a request to the backend whenver there is an update in the debounced username value
  useEffect(() => {
    console.log("Hi");
    const checkUsernameUnique = async () => {
      if (username) {
        // For loader
        setIsCheckingUsername(true)
        // Clear ourt previous messages
        setUsernameMessage('')

        try {
          const response = await axios.get(`/api/check-username-unique?username=${username}`)

          setUsernameMessage(response.data.message)
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username"
          )
        } finally {
          setIsCheckingUsername(false)
        }
      }
    }

    checkUsernameUnique()
  }, [username])

  // This method defines how the form will be handled
  // data returns the defaultValues
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      // Since data is an object itself, we can pass directly.
      const response = await axios.post<ApiResponse>(`/api/signup`, data)

      toast.success(response.data.message)
      router?.replace(`verify/${username}`)

    } catch (error) {
      console.error("Error in signup of user: ", error);
      const axiosError = error as AxiosError<ApiResponse>
      toast.error(axiosError.response?.data.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="mb-4">
            Sign up to send anonymous feedback
          </p>
        </div>
        {/* You need to pass the form variable here */}
        <Form {...form}>
          {/* Pass your own handler to the handleSubmit */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              // Give the same values for name as zod  
              name="username"
              // Passing control to form
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username"
                      {...field}
                      // To add handle change in value
                      // We don't usually have to handle the change in value, but here since we have a different use case with the username, we will have to
                      onChange={(e) => {
                        field.onChange(e)
                        debounced(e.target.value)
                      }}
                    />
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <p className={`text-sm ${usernameMessage === "Username is available." ? 'text-green-500' : 'text-red-500'}`}>
                    {usernameMessage}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              // Give the same values for name as zod  
              name="email"
              // Passing control to form
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              // Give the same values for name as zod  
              name="password"
              // Passing control to form
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ?
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
                </> : 'SignUp'}
            </Button>
          </form>
        </Form>
        <div>
          <p>
            Already a memeber? {' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-800">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default page