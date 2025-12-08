"use client"

import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import * as z from "zod"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [emailSent, setEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setError(null)
      const { error } = await authClient.signIn.magicLink({
        email: value.email,
        callbackURL: "/dashboard",
      })
      if (error) {
        setError(error.message ?? "Failed to send magic link")
        return
      }
      setEmailSent(true)
    },
  })

  if (emailSent) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <div className="flex flex-col items-center gap-4 text-center">
          <Link
            href="/"
            className="flex flex-col items-center gap-2 font-medium"
          >
            <h1 className="font-serif text-3xl text-neutral-200 mt-1.5">
              Cards
            </h1>
          </Link>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-medium">Check your email</p>
            <FieldDescription>
              We sent a magic link to{" "}
              <span className="font-medium text-neutral-200">
                {form.state.values.email}
              </span>
            </FieldDescription>
            <FieldDescription>
              Click the link in the email to sign in.
            </FieldDescription>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <h1 className="font-serif text-3xl text-neutral-200 mt-1.5">
                Cards
              </h1>
            </Link>
            <FieldDescription>
              Sign in with your email address
            </FieldDescription>
          </div>
          <form.Field
            name="email"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid
              return (
                <Field data-invalid={isInvalid || !!error}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid || !!error}
                    placeholder="name@example.com"
                    autoComplete="email"
                    disabled={form.state.isSubmitting}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                  {error && <FieldError>{error}</FieldError>}
                </Field>
              )
            }}
          />
          <Field>
            <Button type="submit" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? "Sending..." : "Continue with email"}
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
