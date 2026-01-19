'use client';

import { useState } from 'react';

interface PdfUploadProps {
  isUploading: boolean;
  onUpload: (file: File) => void;
}

export default function PdfUpload({ isUploading, onUpload }: PdfUploadProps) {
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pdfFile) {
      onUpload(pdfFile);
      setPdfFile(null);
    }
  };

  return (
    <div className="pdf-upload-card">
      <div className="pdf-upload-header">
        <h3>Cotización Rápida</h3>
      </div>
      <p>Sube tu lista de productos en PDF</p>

      <form onSubmit={handleSubmit} className="pdf-form">
        <label className="file-input-label">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="file-input-hidden"
          />
          <span className="file-input-text">
            {pdfFile ? pdfFile.name : 'Seleccionar archivo PDF'}
          </span>
        </label>

        <button
          type="submit"
          className="btn btn-accent btn-block"
          disabled={!pdfFile || isUploading}
        >
          {isUploading ? 'Procesando...' : 'Procesar PDF'}
        </button>
      </form>
    </div>
  );
}
