'use client';

import { useState, FormEvent, ChangeEvent, useRef } from 'react';

interface GuardItem {
  id: string;
  buildingNo: number;
  buildingName: string;
  securityGuard: string;
  contactNumber: string;
  constructionStatus: string;
  tags: string;
}

export default function GuardsManagement() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file first!');
      return;
    }

    setLoading(true);
    setMessage('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload-guards', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || 'File uploaded successfully!');
      } else {
        setMessage(data.error || 'Upload failed');
      }
    } catch (err) {
      setMessage('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#2563eb' }}>Security Guards Upload & Management</h2>

      {/* Template Download */}
      <div style={{ marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Step 1: Download Excel Template</p>
        <a 
          href="/api/download-template" 
          style={{ background: '#059669', color: '#fff', padding: '8px 16px', textDecoration: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold', display: 'inline-block' }}
        >
          Download Excel Template
        </a>
      </div>

      {/* Upload Form */}
      <form onSubmit={handleUpload} style={{ marginBottom: '30px', background: '#f8fafc', padding: '15px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>Step 2: Upload Excel (.xlsx) or PDF File</p>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          accept=".xlsx, .xls, .pdf" 
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Custom Browse Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{ background: '#4f46e5', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Browse File
          </button>
          <span style={{ fontSize: '14px', color: '#4b5563' }}>
            {file ? file.name : 'No file chosen'}
          </span>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Uploading & Parsing...' : 'Upload File'}
        </button>

        {message && <p style={{ marginTop: '10px', fontWeight: 'bold', color: message.includes('success') || message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      </form>
    </div>
  );
}