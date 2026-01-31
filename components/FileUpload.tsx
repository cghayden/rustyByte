'use client';

import { useState, useCallback } from 'react';
import { validateFile } from '@/lib/s3';

interface UploadedFile {
  id?: number;
  name: string;
  filename: string;
  size: number;
  s3Key?: string;
}

interface FileUploadProps {
  challengeId?: string;
  onFilesChange?: (files: UploadedFile[]) => void;
  existingFiles?: UploadedFile[];
}

export default function FileUploadComponent({
  challengeId,
  onFilesChange,
  existingFiles = [],
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const updateFiles = useCallback(
    (newFiles: UploadedFile[]) => {
      setFiles(newFiles);
      onFilesChange?.(newFiles);
    },
    [onFilesChange]
  );

  const uploadFile = useCallback(
    async (file: File, displayName?: string, description?: string) => {
      if (!challengeId) {
        alert('Challenge ID is required for file upload');
        return;
      }

      // Validate file on client side
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('challengeId', challengeId);
        if (displayName) formData.append('displayName', displayName);
        if (description) formData.append('description', description);

        const response = await fetch('/api/files', {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (response.ok) {
          const newFiles = [...files, result.file];
          updateFiles(newFiles);
        } else {
          alert(result.error || 'Upload failed');
        }
      } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [challengeId, files, updateFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        uploadFile(file);
      }
    },
    [uploadFile]
  );

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadFile(file);
    }
  };

  const removeFile = async (index: number) => {
    const fileToRemove = files[index];
    
    // Only call API to delete if file has an ID (exists in database)
    if (fileToRemove.id) {
      if (!confirm(`Are you sure you want to delete ${fileToRemove.filename}?`)) {
        return;
      }

      try {
        const response = await fetch(`/api/files?fileId=${fileToRemove.id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          alert(result.error || 'Failed to delete file');
          return;
        }
        
        console.log('File deleted successfully');
      } catch (error) {
        console.error('Delete error:', error);
        alert('Failed to delete file');
        return;
      }
    }

    // Update local state after successful deletion
    const newFiles = files.filter((_, i) => i !== index);
    updateFiles(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <label className='block text-sm font-medium text-gray-700'>
          Challenge Files
        </label>
        <span className='text-xs text-gray-500'>
          Max 50MB • ZIP, images, executables, PCAP files
        </span>
      </div>

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className='space-y-2'>
          <div className='mx-auto w-12 h-12 text-gray-400'>📁</div>
          <div>
            <p className='text-sm text-gray-600'>
              {uploading
                ? 'Uploading...'
                : 'Drop files here or click to browse'}
            </p>
            <p className='text-xs text-gray-500 mt-1'>
              Supports: ZIP, RAR, images, executables, PCAP, text files
            </p>
          </div>
        </div>
        <input
          type='file'
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          onChange={handleFileInput}
          disabled={uploading}
          accept='.zip,.rar,.7z,.tar.gz,.jpg,.jpeg,.png,.gif,.webp,.txt,.pdf,.json,.exe,.bin,.pcap,.pcapng,.db,.sqlite'
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className='space-y-2'>
          <h4 className='text-sm font-medium text-gray-700'>Uploaded Files:</h4>
          {files.map((file, index) => (
            <div
              key={index}
              className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'
            >
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-gray-900 truncate'>
                  {file.name}
                </p>
                <p className='text-xs text-gray-500'>
                  {file.filename} • {formatFileSize(file.size)}
                </p>
              </div>
              <button
                type='button'
                onClick={() => removeFile(index)}
                className='ml-3 text-xs text-red-600 hover:text-red-800 focus:outline-none'
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Hidden inputs for form submission */}
      {files.map((file, index) => (
        <div key={index}>
          <input
            type='hidden'
            name={`files[${index}][name]`}
            value={file.name}
          />
          <input
            type='hidden'
            name={`files[${index}][filename]`}
            value={file.filename}
          />
          <input
            type='hidden'
            name={`files[${index}][size]`}
            value={file.size}
          />
          {file.s3Key && (
            <input
              type='hidden'
              name={`files[${index}][s3Key]`}
              value={file.s3Key}
            />
          )}
          {file.id && (
            <input type='hidden' name={`files[${index}][id]`} value={file.id} />
          )}
        </div>
      ))}
    </div>
  );
}
