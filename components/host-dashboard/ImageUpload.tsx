import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      return;
    }

    const file = acceptedFiles[0];
    setUploading(true);
    setError(null);
    setUploadedUrl(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/v1/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      const url = data.url;

      setUploadedUrl(url);
      onUploadComplete(url);
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  });

  return (
    <div {...getRootProps()} className={`relative w-full p-4 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out 
      ${isDragActive ? 'border-sky-500 bg-sky-50' : 'border-stone-300 hover:border-sky-400'}
      ${uploadedUrl ? 'border-emerald-500' : ''}
      ${error ? 'border-red-500' : ''}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        {uploading ? (
            <>
                <Loader className="animate-spin h-8 w-8 text-stone-500" />
                <p className="mt-2 text-sm text-stone-600">Uploading...</p>
            </>
        ) : error ? (
            <>
                <AlertCircle className="h-8 w-8 text-red-500" />
                <p className="mt-2 text-sm text-red-600">{error}</p>
            </>
        ) : uploadedUrl ? (
            <>
                <CheckCircle className="h-8 w-8 text-emerald-500" />
                <p className="mt-2 text-sm text-emerald-600">Upload complete!</p>
                <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-stone-500 hover:underline mt-1 truncate max-w-full">View Image</a>
            </>
        ) : (
            <>
                <UploadCloud className="h-8 w-8 text-stone-400" />
                <p className="mt-2 text-sm text-stone-600">
                    {isDragActive ? "Drop the image here..." : "Drag 'n' drop an image here, or click to select one"}
                </p>
                <p className="text-xs text-stone-500 mt-1">PNG, JPG, GIF up to 10MB</p>
            </>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;
