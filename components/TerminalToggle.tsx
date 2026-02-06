'use client';

import { useState } from 'react';
import { DockerImageConfig } from '@/lib/dockerImages';

interface TerminalToggleProps {
  dockerImages: DockerImageConfig[];
}

export default function TerminalToggle({ dockerImages }: TerminalToggleProps) {
  const [requiresTerminal, setRequiresTerminal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [validationStatus, setValidationStatus] = useState<
    'idle' | 'validating' | 'valid' | 'invalid'
  >('idle');
  const [validationError, setValidationError] = useState('');

  const handleImageChange = async (imageTag: string) => {
    setSelectedImage(imageTag);
    setValidationStatus('idle');
    setValidationError('');

    if (!imageTag) return;

    // Validate the image exists on the server
    setValidationStatus('validating');
    try {
      const response = await fetch('/api/docker/validate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageTag }),
      });

      const data = await response.json();

      if (data.exists) {
        setValidationStatus('valid');
      } else {
        setValidationStatus('invalid');
        setValidationError(data.error || 'Image not found on server');
      }
    } catch (error) {
      setValidationStatus('invalid');
      setValidationError('Failed to validate image');
    }
  };

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
            if (!e.target.checked) {
              setSelectedImage('');
              setValidationStatus('idle');
              setValidationError('');
            }
          }}
          className="w-4 h-4 text-stone-600 border-stone-800 rounded focus:ring-stone-500"
        />
        <label htmlFor="requiresTerminal" className="text-sm font-medium text-gray-700">
          This challenge requires a terminal
        </label>
      </div>

      {/* Docker Image Selection (shown when terminal is required) */}
      {requiresTerminal && (
        <div className="ml-7 space-y-2">
          <label htmlFor="dockerImage" className="block text-sm font-medium text-gray-700">
            Docker Image
          </label>
          <select
            id="dockerImage"
            name="dockerImage"
            required={requiresTerminal}
            value={selectedImage}
            onChange={(e) => handleImageChange(e.target.value)}
            className="w-full px-2 py-1.5 border border-stone-800 bg-amber-50 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:border-stone-900 text-stone-800 text-sm"
          >
            <option value="">Select a Docker image...</option>
            {dockerImages.map((image) => (
              <option key={image.tag} value={image.tag}>
                {image.name}
              </option>
            ))}
          </select>

          {/* Image description */}
          {selectedImage && (
            <p className="text-xs text-gray-500">
              {dockerImages.find((img) => img.tag === selectedImage)?.description}
            </p>
          )}

          {/* Validation status */}
          {validationStatus === 'validating' && (
            <p className="text-xs text-blue-600">Validating image...</p>
          )}
          {validationStatus === 'valid' && (
            <p className="text-xs text-green-600">✓ Image exists on server</p>
          )}
          {validationStatus === 'invalid' && (
            <p className="text-xs text-red-600">✗ {validationError}</p>
          )}
        </div>
      )}
    </div>
  );
}
