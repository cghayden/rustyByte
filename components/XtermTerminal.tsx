'use client';

import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

interface XtermTerminalProps {
  websocketUrl: string;
  className?: string;
}

export default function XtermTerminal({
  websocketUrl,
  className,
}: XtermTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<Terminal | null>(null);
  const websocket = useRef<WebSocket | null>(null);
  const fitAddon = useRef<FitAddon | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const isCleaningUp = useRef(false);

  useEffect(() => {
    if (!terminalRef.current) return;
    isCleaningUp.current = false;

    // Create terminal instance
    terminal.current = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
      theme: {
        background: '#000000',
        foreground: '#ffffff',
        cursor: '#ffffff',
        selectionBackground: '#ffffff40',
      },
      cols: 80,
      rows: 24,
    });

    // Create and load addons
    fitAddon.current = new FitAddon();
    const webLinksAddon = new WebLinksAddon();

    terminal.current.loadAddon(fitAddon.current);
    terminal.current.loadAddon(webLinksAddon);

    // Open terminal in DOM
    terminal.current.open(terminalRef.current);
    
    // Fit terminal after a delay to ensure DOM is fully ready
    setTimeout(() => {
      if (fitAddon.current && terminal.current) {
        try {
          fitAddon.current.fit();
        } catch {
          // Retry fit after a longer delay
          setTimeout(() => {
            if (fitAddon.current && terminal.current) {
              try {
                fitAddon.current.fit();
              } catch {
                // Give up if it fails twice
              }
            }
          }, 500);
        }
      }
    }, 200);

    // Connect to WebSocket
    const connectWebSocket = () => {
      if (isCleaningUp.current) {
        return;
      }
      
      if (reconnectAttempts.current >= maxReconnectAttempts) {
        terminal.current?.write(
          '\r\n\x1b[31mFailed to connect after multiple attempts. Please restart the terminal.\x1b[0m\r\n'
        );
        return;
      }

      try {
        websocket.current = new WebSocket(websocketUrl, ['tty']);
        websocket.current.binaryType = 'arraybuffer';

        websocket.current.onopen = () => {
          reconnectAttempts.current = 0;
          terminal.current?.write('\r\n\x1b[32mTerminal connected!\x1b[0m\r\n');
          
          // Send terminal size to ttyd after a small delay to ensure WebSocket is fully ready
          if (terminal.current && websocket.current) {
            setTimeout(() => {
              if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
                const cols = terminal.current!.cols;
                const rows = terminal.current!.rows;
                const resizeMsg = JSON.stringify({ columns: cols, rows: rows });
                const message = '2' + resizeMsg;
                const buffer = new ArrayBuffer(message.length);
                const view = new Uint8Array(buffer);
                for (let i = 0; i < message.length; i++) {
                  view[i] = message.charCodeAt(i);
                }
                websocket.current.send(buffer);
              }
            }, 100);
          }
        };

        websocket.current.onmessage = (event) => {
          if (terminal.current) {
            if (typeof event.data === 'string') {
              const data = event.data.length > 1 ? event.data.substring(1) : event.data;
              terminal.current.write(data);
            } else if (event.data instanceof ArrayBuffer) {
              const uint8Array = new Uint8Array(event.data);
              if (uint8Array.length > 1) {
                terminal.current.write(uint8Array.slice(1));
              }
            }
          }
        };

        websocket.current.onclose = (event) => {
          if (isCleaningUp.current) {
            return;
          }
          
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
          reconnectAttempts.current++;

          if (event.code !== 1000 && reconnectAttempts.current <= maxReconnectAttempts) {
            terminal.current?.write(
              `\r\n\x1b[33mConnection closed (code: ${event.code}). Reconnecting in ${delay/1000}s... (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})\x1b[0m\r\n`
            );
          }

          reconnectTimeout.current = setTimeout(() => {
            if (terminal.current && !isCleaningUp.current) {
              connectWebSocket();
            }
          }, delay);
        };

        websocket.current.onerror = () => {
          // Error handling done in onclose
        };
      } catch (error) {
        terminal.current?.write(
          '\r\n\x1b[31mFailed to connect to terminal\x1b[0m\r\n'
        );
      }
    };

    // Handle terminal input
    terminal.current.onData((data) => {
      if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
        const message = '0' + data;
        const buffer = new ArrayBuffer(message.length);
        const view = new Uint8Array(buffer);
        for (let i = 0; i < message.length; i++) {
          view[i] = message.charCodeAt(i);
        }
        websocket.current.send(buffer);
      }
    });

    // Wait 2 seconds before initial connection
    terminal.current?.write('\r\n\x1b[33mWaiting for container to be ready...\x1b[0m\r\n');
    setTimeout(() => {
      connectWebSocket();
    }, 2000);

    // Handle window resize
    const handleResize = () => {
      if (fitAddon.current && terminal.current) {
        try {
          fitAddon.current.fit();
          
          if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
            const cols = terminal.current.cols;
            const rows = terminal.current.rows;
            const resizeMsg = JSON.stringify({ columns: cols, rows: rows });
            const message = '2' + resizeMsg;
            const buffer = new ArrayBuffer(message.length);
            const view = new Uint8Array(buffer);
            for (let i = 0; i < message.length; i++) {
              view[i] = message.charCodeAt(i);
            }
            websocket.current.send(buffer);
          }
        } catch {
          // Ignore fit errors
        }
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      isCleaningUp.current = true;
      
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      
      window.removeEventListener('resize', handleResize);

      if (websocket.current) {
        websocket.current.close();
        websocket.current = null;
      }

      if (terminal.current) {
        terminal.current.dispose();
        terminal.current = null;
      }
    };
  }, [websocketUrl]);

  // Focus terminal when component mounts
  useEffect(() => {
    if (terminal.current) {
      terminal.current.focus();
    }
  }, []);

  return (
    <div
      className={`bg-black rounded border border-gray-700 ${className || ''}`}
    >
      <div className='p-2 bg-gray-800 rounded-t border-b border-gray-700'>
        <div className='flex items-center gap-2'>
          <div className='w-3 h-3 rounded-full bg-red-500'></div>
          <div className='w-3 h-3 rounded-full bg-yellow-500'></div>
          <div className='w-3 h-3 rounded-full bg-green-500'></div>
          <span className='ml-2 text-gray-300 text-sm'>Terminal</span>
        </div>
      </div>
      <div ref={terminalRef} className='p-2' style={{ height: '400px' }} />
    </div>
  );
}
