"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload, X, User, AlertCircle, CheckCircle2 } from "lucide-react"

interface PhotoUploadProps {
  currentPhoto?: string
  onPhotoChange: (photoUrl: string | null) => void
  fallbackText: string
  size?: "sm" | "md" | "lg"
  className?: string
  disabled?: boolean
}

export default function PhotoUpload({
  currentPhoto,
  onPhotoChange,
  fallbackText,
  size = "md",
  className = "",
  disabled = false
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setError("")
    setSuccess("")
    setUploading(true)

    // Convert to base64 for preview (in production, upload to storage service)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      onPhotoChange(result)
      setSuccess("Photo uploaded successfully!")
      setUploading(false)
    }
    reader.onerror = () => {
      setError("Failed to read the image file")
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = () => {
    onPhotoChange(null)
    setSuccess("Photo removed")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileSelect = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Avatar className={`${sizeClasses[size]} border-2 border-gray-200 hover:border-burgundy-300 transition-colors cursor-pointer`}>
            <AvatarImage src={currentPhoto || ""} alt="Profile photo" />
            <AvatarFallback className="bg-gray-100 text-gray-600">
              {fallbackText.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          {!disabled && (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 shadow-md"
              onClick={triggerFileSelect}
              disabled={uploading}
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-burgundy-600"></div>
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>

        {!disabled && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={triggerFileSelect}
              disabled={uploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {currentPhoto ? "Change Photo" : "Upload Photo"}
            </Button>
            
            {currentPhoto && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemovePhoto}
                disabled={uploading}
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <div className="text-xs text-gray-500 text-center">
        <p>Supported formats: JPG, PNG, GIF</p>
        <p>Maximum size: 5MB</p>
      </div>
    </div>
  )
}
