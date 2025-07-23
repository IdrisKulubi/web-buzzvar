'use client'

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSpinner } from "./loading-spinner"
import { ErrorMessage } from "./error-boundary"
import { Upload, X, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange: (url: string | null) => void
  disabled?: boolean
  className?: string
  accept?: string
  maxSize?: number // in MB
  placeholder?: string
}

export function ImageUpload({
  value,
  onChange,
  disabled = false,
  className,
  accept = "image/*",
  maxSize = 5,
  placeholder = "Click to upload an image"
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size must be less than ${maxSize}MB`)
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)

      // Upload to your API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <Card className="relative overflow-hidden">
          <div className="aspect-video relative">
            <Image
              src={value}
              alt="Uploaded image"
              fill
              className="object-cover"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <Card
          className={cn(
            "border-dashed border-2 p-6 text-center cursor-pointer hover:border-primary transition-colors",
            disabled && "opacity-50 cursor-not-allowed",
            loading && "pointer-events-none"
          )}
          onClick={handleClick}
        >
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner />
              <p className="text-sm text-muted-foreground">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-muted rounded-full">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{placeholder}</p>
                <p className="text-xs text-muted-foreground">
                  Max size: {maxSize}MB
                </p>
              </div>
              <Button type="button" variant="outline" size="sm" disabled={disabled}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          )}
        </Card>
      )}

      {error && <ErrorMessage message={error} />}
    </div>
  )
}