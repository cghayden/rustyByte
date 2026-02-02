// components/TerminalInstance.tsx
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import XtermTerminal with SSR disabled
const XtermTerminal = dynamic(() => import('./XtermTerminal'), {
  ssr: false,
  loading: () => (
    <div className='flex items-center justify-center h-full bg-black text-white'>
      <div className='animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full'></div>
    </div>
  ),
});

interface Instance {
  id: string;
  containerName: string;
  hostPort?: number;
  authToken?: string;
  status: string;
  createdAt: string;
  challenge: {
    id: string;
    slug: string;
    title: string;
  };
}

interface TerminalInstanceProps {
  userId: string;
  challengeId: string;
  className?: string;
}

export default function TerminalInstance({
  userId,
  challengeId,
  className,
}: TerminalInstanceProps) {
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createInstance = async () => {
    setLoading(true);
    setError(null);

    try {
      // First check if there's a paused instance to resume
      const checkResponse = await fetch(`/api/instances?userId=${userId}`);
      const checkData = await checkResponse.json();
      
      if (checkData.success) {
        const existingInstance = checkData.instances.find(
          (inst: Instance) =>
            inst.challenge.id === challengeId && inst.status === 'paused'
        );
        
        if (existingInstance) {
          // Unpause existing instance
          const unpauseResponse = await fetch(`/api/instances/${existingInstance.id}/unpause`, {
            method: 'POST',
          });
          
          if (unpauseResponse.ok) {
            setInstance({ ...existingInstance, status: 'running' });
            setLoading(false);
            return;
          }
        }
      }

      // No paused instance, create new one
      const response = await fetch('/api/instances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, challengeId }),
      });

      const data = await response.json();

      if (data.success) {
        setInstance(data.instance);
      } else {
        setError(data.error || 'Failed to create instance');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Stop functionality disabled - instances persist across sessions
  // Will add reset capability with age limitation later

  // Check for existing instance on mount
  useEffect(() => {
    const fetchExistingInstance = async () => {
      try {
        const response = await fetch(`/api/instances?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          const existingInstance = data.instances.find(
            (inst: Instance) =>
              inst.challenge.id === challengeId && inst.status === 'running'
          );
          if (existingInstance) {
            setInstance(existingInstance);
          }
        }
      } catch (err) {
        console.error('Error fetching existing instances:', err);
      }
    };

    fetchExistingInstance();
  }, [userId, challengeId]);

  // Poll status every 30 seconds if instance is running
  useEffect(() => {
    if (instance && instance.status === 'running') {
      const pollStatus = async () => {
        try {
          const response = await fetch(`/api/instances/${instance.id}`);
          const data = await response.json();

          if (data.success) {
            setInstance(data.instance);
          }
        } catch (error) {
          console.error('Error checking status:', error);
        }
      };

      const interval = setInterval(pollStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [instance]);

  // Auto-pause when user leaves the page
  useEffect(() => {
    if (!instance || instance.status !== 'running') return;

    const handleVisibilityChange = async () => {
      if (document.hidden && instance.status === 'running') {
        // User left the page - pause container to save resources
        try {
          await fetch(`/api/instances/${instance.id}/pause`, {
            method: 'POST',
          });
        } catch (error) {
          console.error('Error pausing container:', error);
        }
      } else if (!document.hidden && instance.status === 'paused') {
        // User returned - unpause container
        try {
          const response = await fetch(`/api/instances/${instance.id}/unpause`, {
            method: 'POST',
          });
          if (response.ok) {
            setInstance({ ...instance, status: 'running' });
          }
        } catch (error) {
          console.error('Error unpausing container:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [instance]);

  return (
    <div className={`bg-gray-900 p-4 rounded-lg ${className}`}>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-white'>Terminal Access</h3>
        <div className='flex gap-2'>
          {!instance || (instance.status !== 'running' && instance.status !== 'paused') ? (
            <button
              onClick={createInstance}
              disabled={loading}
              className='px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
            >
              {loading ? 'Starting...' : 'Start Terminal'}
            </button>
          ) : instance.status === 'paused' ? (
            <button
              onClick={createInstance}
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed'
            >
              {loading ? 'Resuming...' : 'Resume Terminal'}
            </button>
          ) : (
            <span className='text-sm text-green-400 px-4 py-2'>
              ● Terminal Active
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className='mb-4 p-3 bg-red-900/50 text-red-200 rounded border border-red-800'>
          {error}
        </div>
      )}

      {instance && (
        <div className='space-y-4'>
          <div className='flex items-center gap-4 text-sm text-gray-400'>
            <span>
              Status:
              <span
                className={`ml-1 font-medium ${
                  instance.status === 'running'
                    ? 'text-green-400'
                    : instance.status === 'stopped'
                    ? 'text-red-400'
                    : 'text-yellow-400'
                }`}
              >
                {instance.status}
              </span>
            </span>
            {instance.hostPort && (
              <span>
                Port: <span className='text-blue-400'>{instance.hostPort}</span>
              </span>
            )}
          </div>

          {instance.status === 'running' && instance.hostPort && (
            <div className='space-y-4'>
              <div className='text-sm text-gray-400 mb-4'>
                Your interactive terminal is ready!
              </div>

              {/* 
                SECURITY: Embedded ttyd terminal
                
                Security is provided by:
                - Localhost-only binding (127.0.0.1) - prevents external network access
                - Application-level authentication - only logged-in users can access this page
                - One instance per user per challenge - isolated environments
                - Resource limits on containers - prevents DOS attacks
              */}
              <div className='border border-gray-700 rounded overflow-hidden' style={{ height: '500px' }}>
                <iframe
                  src={`https://bristolctf.club/terminal/${instance.hostPort}`}
                  className='w-full h-full'
                  title='Terminal'
                  style={{ border: 'none' }}
                />
              </div>

              {/* Alternative: Custom XTerm implementation (currently has WebSocket issues) */}
              <details className='mt-4'>
                <summary className='text-sm text-gray-400 cursor-pointer hover:text-gray-300'>
                  Alternative: Custom terminal (experimental)
                </summary>
                <div className='mt-2'>
                  <XtermTerminal
                    websocketUrl={`ws://localhost:${instance.hostPort}/ws`}
                    className='w-full'
                  />
                </div>
              </details>
            </div>
          )}

          {instance.status === 'creating' && (
            <div className='text-center py-8 text-gray-400'>
              <div className='animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2'></div>
              Container is starting up...
            </div>
          )}
        </div>
      )}

      {!instance && (
        <div className='text-center py-8 text-gray-400'>
          Click &quot;Start Terminal&quot; to launch your dedicated Linux
          environment for this challenge.
        </div>
      )}
    </div>
  );
}
