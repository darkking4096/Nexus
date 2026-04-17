import React from 'react';
import { cn } from '../../utils/cn';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  error?: string;
  label?: string;
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ onFileSelect, accept = 'image/*', maxSize = 5 * 1024 * 1024, error, label = 'Click or Drag to Upload' }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const validateAndHandle = (file: File) => {
      if (maxSize && file.size > maxSize) {
        return; // Error handled by parent
      }
      onFileSelect(file);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) validateAndHandle(file);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndHandle(file);
    };

    return (
      <div ref={ref} className="w-full">
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            error ? 'border-error bg-red-50' : 'border-primary bg-blue-50',
            isDragOver && 'bg-indigo-100 border-solid'
          )}
          onClick={() => inputRef.current?.click()}
        >
          <div className="text-4xl mb-3">📸</div>
          <p className="text-text-primary font-medium">{label}</p>
          <p className="text-xs text-text-secondary mt-2">or paste an image</p>

          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            aria-label="Upload file"
          />
        </div>

        {error && <p className="text-xs text-error mt-2">{error}</p>}
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';
