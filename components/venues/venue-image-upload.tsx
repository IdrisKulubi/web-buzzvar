"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Upload, X, Image as ImageIcon, Video, FileImage, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

interface VenueImageUploadProps {
  onUpload: (formData: FormData) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
}

export function VenueImageUpload({
  onUpload,
  accept = "image/*,video/*",
  maxSize = 10,
  className,
  disabled = false
}: VenueImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    
    if (!isImage && !isVideo) {
      return "Please select an image or video file";
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  };

  const isVideo = (file: File) => file.type.startsWith("video/");
  const isImage = (file: File) => file.type.startsWith("image/");

  const createPreview = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    
    // Clean up previous preview URL
    return () => URL.revokeObjectURL(url);
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);
    const cleanup = createPreview(file);
    
    // Store cleanup function for later use
    return cleanup;
  }, [createPreview, maxSize]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption("");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("caption", caption);

      await onUpload(formData);
      
      // Reset form after successful upload
      clearSelection();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card 
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CardContent 
          className="p-8 text-center space-y-4"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled}
          />
          
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Upload Media</h3>
            <p className="text-sm text-muted-foreground">
              Drag and drop your files here, or click to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileImage className="h-3 w-3" />
                Images: JPG, PNG, WebP
              </div>
              <div className="flex items-center gap-1">
                <FileVideo className="h-3 w-3" />
                Videos: MP4, MOV, WebM
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Max file size: {maxSize}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Preview and Form */}
      {selectedFile && preview && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Preview & Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* File Preview */}
            <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
              {isVideo(selectedFile) ? (
                <video
                  src={preview}
                  className="w-full h-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* File Info Overlay */}
              <div className="absolute top-2 left-2">
                <div className="bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  {isVideo(selectedFile) ? (
                    <Video className="h-3 w-3" />
                  ) : (
                    <ImageIcon className="h-3 w-3" />
                  )}
                  {selectedFile.name}
                </div>
              </div>
            </div>

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="caption" className="text-sm font-medium block mb-2">
                  Caption (optional)
                </label>
                <Textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Add a description for this media..."
                  rows={3}
                  disabled={isUploading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isUploading || !selectedFile}
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload {isVideo(selectedFile) ? 'Video' : 'Photo'}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}