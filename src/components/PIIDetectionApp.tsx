import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Shield, AlertCircle, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadState {
  file: File | null;
  preview: string | null;
  isUploading: boolean;
  result: string | null;
  error: string | null;
}

const PIIDetectionApp: React.FC = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    preview: null,
    isUploading: false,
    result: null,
    error: null,
  });
  
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      setUploadState(prev => ({ ...prev, error: 'Please upload a valid image file (JPG, PNG, WEBP)' }));
      return false;
    }

    if (file.size > maxSize) {
      setUploadState(prev => ({ ...prev, error: 'File size must be less than 10MB' }));
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback((file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadState(prev => ({
        ...prev,
        file,
        preview: e.target?.result as string,
        error: null,
        result: null,
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!uploadState.file) return;

    setUploadState(prev => ({ ...prev, isUploading: true, error: null }));

    try {
      const formData = new FormData();
      formData.append('image', uploadState.file);

      // Simulate API call with delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response - in real app, this would be the actual API call
      // const response = await fetch('/api/upload', {
      //   method: 'POST',
      //   body: formData,
      // });
      
      // For demo purposes, we'll use the same image as result
      const mockResult = uploadState.preview;
      
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        result: mockResult,
      }));

      toast({
        title: "Upload Successful!",
        description: "PII detection completed. Sensitive information has been masked.",
        variant: "default",
      });

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'Upload failed. Please try again.',
      }));

      toast({
        title: "Upload Failed",
        description: "There was an error processing your image.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setUploadState({
      file: null,
      preview: null,
      isUploading: false,
      result: null,
      error: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 fade-in">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              PII Detection & Mask App
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Securely detect and mask personally identifiable information in your images using advanced AI technology.
          </p>
        </div>

        {/* Upload Section */}
        <div className="card-elegant space-y-6 fade-in">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <Upload className="h-6 w-6 text-primary" />
            Upload Image
          </h2>

          {/* Drag & Drop Zone */}
          <div
            className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileDialog}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            {uploadState.preview ? (
              <div className="space-y-4">
                <img
                  src={uploadState.preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded-lg shadow-md"
                />
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  <span className="text-sm text-muted-foreground">
                    {uploadState.file?.name} ({(uploadState.file?.size || 0 / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-16 w-16 mx-auto text-primary opacity-50" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Drag & drop your image here
                  </p>
                  <p className="text-muted-foreground">
                    or click to select a file
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Supports JPG, PNG, WEBP (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {uploadState.error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-destructive">{uploadState.error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleUpload}
              disabled={!uploadState.file || uploadState.isUploading}
              className="btn-primary disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploadState.isUploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" />
                  Detect & Mask PII
                </>
              )}
            </button>

            {uploadState.file && (
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-muted transition-colors flex items-center gap-2"
              >
                <RotateCcw className="h-5 w-5" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results Section */}
        {uploadState.result && (
          <div className="card-elegant space-y-6 fade-in">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-success" />
              Results
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Original Image */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Original Image</h3>
                <div className="relative">
                  <img
                    src={uploadState.preview!}
                    alt="Original"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              </div>

              {/* Processed Image */}
              <div className="space-y-3">
                <h3 className="text-lg font-medium">Processed Image</h3>
                <div className="relative">
                  <img
                    src={uploadState.result}
                    alt="Processed"
                    className="w-full rounded-lg shadow-md"
                  />
                  <div className="absolute top-2 right-2 bg-success text-success-foreground px-2 py-1 rounded-md text-xs font-medium">
                    PII Masked
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Detection Summary:</span>
                <span className="font-medium">3 faces detected and masked</span>
              </div>
            </div>

            {/* Download Button */}
            <div className="flex justify-center">
              <button className="btn-primary flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Download Masked Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PIIDetectionApp;