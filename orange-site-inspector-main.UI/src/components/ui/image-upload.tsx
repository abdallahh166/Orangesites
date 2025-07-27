import React, { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/api/utils";

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  onImageRemove?: () => void;
  selectedImage?: File | null;
  label?: string;
  description?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  required?: boolean;
  imageType?: 'before' | 'after';
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelect,
  onImageRemove,
  selectedImage,
  label = "Upload Image",
  description = "Click to upload or drag and drop",
  accept = "image/*",
  maxSize = 10,
  className,
  disabled = false,
  required = false,
  imageType = 'before'
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate preview URL when image is selected
  React.useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please select an image file (JPG, PNG, GIF)';
    }

    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    return null;
  }, [maxSize]);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setIsUploading(true);

    try {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      onImageSelect(file);
    } catch (err) {
      setError('Failed to process image');
    } finally {
      setIsUploading(false);
    }
  }, [validateFile, onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleRemove = useCallback(() => {
    if (onImageRemove) {
      onImageRemove();
    }
    setError(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onImageRemove]);

  const getImageTypeColor = () => {
    return imageType === 'before' ? 'border-blue-500 bg-blue-50' : 'border-green-500 bg-green-50';
  };

  const getImageTypeIcon = () => {
    return imageType === 'before' ? '📸' : '✅';
  };

  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <span className="text-xs text-gray-500">
            {getImageTypeIcon()} {imageType === 'before' ? 'Before' : 'After'}
          </span>
        </div>
      )}

      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200",
          "flex flex-col items-center justify-center p-6 min-h-[200px]",
          {
            "border-orange-500 bg-orange-50 dark:bg-orange-900/20": isDragOver,
            "border-gray-300 dark:border-gray-600": !isDragOver && !selectedImage,
            [getImageTypeColor()]: selectedImage,
            "opacity-50 cursor-not-allowed": disabled,
            "cursor-pointer hover:border-orange-400 hover:bg-orange-50/50": !disabled && !selectedImage
          }
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !selectedImage && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        {selectedImage && previewUrl ? (
          // Image Preview
          <div className="relative w-full h-full">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 hover:opacity-100 transition-opacity duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove();
                  }}
                  className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-green-500 text-white p-1 rounded-full">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
        ) : (
          // Upload Area
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-3">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                <span className="text-sm text-gray-600">Processing image...</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                  <Camera className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  {description}
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to {maxSize}MB
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* File Info */}
      {selectedImage && (
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded">
          <span className="truncate flex-1">{selectedImage.name}</span>
          <span>{(selectedImage.size / 1024 / 1024).toFixed(1)}MB</span>
        </div>
      )}
    </div>
  );
}; 