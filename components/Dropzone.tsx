import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType } from 'lucide-react';

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      validateAndPass(files[0]);
    }
  }, [disabled]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    if (file.name.endsWith('.docx') || file.type.includes('wordprocessingml.document')) {
      onFileSelected(file);
    } else {
      alert("Vui lòng chỉ chọn file .docx");
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300
        ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-300' : 'cursor-pointer'}
        ${isDragging ? 'border-primary bg-blue-50 scale-[1.02]' : 'border-slate-300 hover:border-primary hover:bg-slate-50'}
      `}
    >
      <input
        type="file"
        accept=".docx"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        onChange={handleFileInput}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100 text-primary' : 'bg-slate-100 text-slate-500'}`}>
          {isDragging ? <FileType size={32} /> : <UploadCloud size={32} />}
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700">
            {isDragging ? 'Thả file vào đây' : 'Kéo thả file Word hoặc click để chọn'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Chỉ hỗ trợ định dạng .docx
          </p>
        </div>
      </div>
    </div>
  );
};
