'use client';

import { useState } from 'react';

interface FileRequirementsProps {
  children: React.ReactNode;
}

export default function FileRequirements({ children }: FileRequirementsProps) {
  const [requiresFiles, setRequiresFiles] = useState(false);

  return (
    <>
      {/* File Requirements Checkbox */}
      <div className='flex items-start gap-3'>
        <input
          type='checkbox'
          id='requiresFiles'
          name='requiresFiles'
          checked={requiresFiles}
          onChange={(e) => setRequiresFiles(e.target.checked)}
          className='w-4 h-4 mt-0.5 text-red-600 border-gray-300 rounded focus:ring-red-500'
        />
        <div className='flex-1'>
          <label
            htmlFor='requiresFiles'
            className='text-sm font-medium text-gray-700'
          >
            This challenge requires files
          </label>
          {requiresFiles && (
            <span className='text-sm text-stone-600 ml-2'>
              - After creating this challenge, you&apos;ll be routed to the file
              upload page
            </span>
          )}
        </div>
      </div>
      {children}
    </>
  );
}
