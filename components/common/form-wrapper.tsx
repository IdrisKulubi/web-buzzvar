'use client'

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "./loading-spinner"
import { ErrorMessage } from "./error-boundary"
import { cn } from "@/lib/utils"

interface FormWrapperProps {
  title?: string
  description?: string
  onSubmit: (formData: FormData) => Promise<void>
  children: React.ReactNode
  submitText?: string
  className?: string
  disabled?: boolean
}

export function FormWrapper({
  title,
  description,
  onSubmit,
  children,
  submitText = "Submit",
  className,
  disabled = false
}: FormWrapperProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await onSubmit(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    })
  }

  return (
    <Card className={cn("w-full max-w-2xl", className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <ErrorMessage 
              message={error} 
              onRetry={() => setError(null)} 
            />
          )}
          
          {children}
          
          <Button 
            type="submit" 
            disabled={isPending || disabled}
            className="w-full"
          >
            {isPending ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Processing...
              </>
            ) : (
              submitText
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

interface SimpleFormProps {
  onSubmit: (formData: FormData) => Promise<void>
  children: React.ReactNode
  submitText?: string
  className?: string
  disabled?: boolean
}

export function SimpleForm({
  onSubmit,
  children,
  submitText = "Submit",
  className,
  disabled = false
}: SimpleFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    startTransition(async () => {
      try {
        await onSubmit(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    })
  }

  return (
    <form action={handleSubmit} className={cn("space-y-4", className)}>
      {error && (
        <ErrorMessage 
          message={error} 
          onRetry={() => setError(null)} 
        />
      )}
      
      {children}
      
      <Button 
        type="submit" 
        disabled={isPending || disabled}
      >
        {isPending ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Processing...
          </>
        ) : (
          submitText
        )}
      </Button>
    </form>
  )
}