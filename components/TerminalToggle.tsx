'use client';

import { useState } from 'react';

export default function TerminalToggle() {
  const [requiresTerminal, setRequiresTerminal] = useState(false);
  const [fileName, setFileName] = useState('');

  return (
    <div className="space-y-3">
      {/* Terminal Toggle */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="requiresTerminal"
          name="requiresTerminal"
          checked={requiresTerminal}
          onChange={(e) => {
            setRequiresTerminal(e.target.checked);
            if (!e.target.checked) setFileName('');
          }}
          className="w-4 h-4 text-stone-600 border-stone-800 rounded focus:ring-stone-500"
        />
        <label htmlFor="requiresTerminal" className="text-sm font-medium text-gray-700">
          This challenge requires a terminal
        </label>
      </div>

      {/* Dockerfile upload (shown when terminal is required) */}
      {requiresTerminal && (
        <div className="ml-7 space-y-1">
          <label htmlFor="dockerfileUpload" className="block text-sm font-medium text-gray-700">
            Upload Dockerfile{' '}
            <span className="font-normal text-gray-500">
              (will be reviewed by an admin before going live)
            </span>
          </label>
          <input
            type="file"
            id="dockerfileUpload"
            name="dockerfileUpload"
            required={requiresTerminal}
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            className="w-full text-sm text-stone-700 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
          />
          {fileName && <p className="text-xs text-gray-500">Selected: {fileName}</p>}
          <p className="text-xs text-amber-700">
            Your challenge will remain <strong>pending</strong> until an admin reviews and approves
            the Dockerfile.
          </p>
        </div>
      )}
    </div>
  );
}
