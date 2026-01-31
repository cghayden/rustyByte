'use client';

import { useState } from 'react';

interface JsonViewerProps {
  data: unknown;
  name?: string;
  depth?: number;
}

export default function JsonViewer({ data, name, depth = 0 }: JsonViewerProps) {
  const [isExpanded, setIsExpanded] = useState(depth < 2);

  const indent = depth * 20;

  if (data === null) {
    return (
      <div style={{ marginLeft: `${indent}px` }} className="text-gray-500">
        {name && <span className="font-semibold">{name}: </span>}
        <span>null</span>
      </div>
    );
  }

  if (data === undefined) {
    return (
      <div style={{ marginLeft: `${indent}px` }} className="text-gray-500">
        {name && <span className="font-semibold">{name}: </span>}
        <span>undefined</span>
      </div>
    );
  }

  if (typeof data !== 'object') {
    return (
      <div style={{ marginLeft: `${indent}px` }} className="text-gray-700">
        {name && <span className="font-semibold text-blue-600">{name}: </span>}
        <span className="text-green-700">
          {typeof data === 'string' ? `"${data}"` : String(data)}
        </span>
      </div>
    );
  }

  const isArray = Array.isArray(data);
  const isEmpty = isArray ? data.length === 0 : Object.keys(data).length === 0;

  if (isEmpty) {
    return (
      <div style={{ marginLeft: `${indent}px` }} className="text-gray-500">
        {name && <span className="font-semibold text-blue-600">{name}: </span>}
        <span>{isArray ? '[]' : '{}'}</span>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: `${indent}px` }} className="my-1">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded w-full text-left"
      >
        <span className="text-gray-500 font-mono w-4">
          {isExpanded ? '▼' : '▶'}
        </span>
        {name && (
          <span className="font-semibold text-blue-600">{name}</span>
        )}
        <span className="text-gray-500">
          {isArray ? `Array[${data.length}]` : `Object{${Object.keys(data).length}}`}
        </span>
      </button>

      {isExpanded && (
        <div className="border-l-2 border-gray-200 ml-2">
          {isArray
            ? data.map((item: unknown, index: number) => (
                <JsonViewer
                  key={index}
                  data={item}
                  name={`[${index}]`}
                  depth={depth + 1}
                />
              ))
            : Object.entries(data).map(([key, value]) => (
                <JsonViewer
                  key={key}
                  data={value}
                  name={key}
                  depth={depth + 1}
                />
              ))}
        </div>
      )}
    </div>
  );
}
