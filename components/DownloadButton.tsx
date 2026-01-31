'use client';

import { useState } from 'react';

interface DownloadButtonProps {
  fileId: number;
  filename: string;
  className?: string;
}

export default function DownloadButton({
  fileId,
  filename,
  className = '',
}: DownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // Get signed download URL from our API
      const response = await fetch(`/api/files?fileId=${fileId}`);

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Create a temporary link and click it to start download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors ${
        downloading
          ? 'text-gray-500 cursor-not-allowed'
          : 'hover:underline cursor-pointer'
      } ${className}`}
    >
      {/* Download arrow icon */}
      <svg
        className={`w-4 h-4 ${downloading ? 'animate-pulse' : ''}`}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
        />
      </svg>
      {downloading ? 'Downloading...' : filename}
    </button>
  );
}
