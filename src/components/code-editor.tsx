
"use client";

import type * as React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface CodeEditorProps {
  filePath: string | null;
  content: string;
  onContentChange: (newContent: string) => void;
}

export function CodeEditor({ filePath, content, onContentChange }: CodeEditorProps) {
  return (
    <div className="flex flex-col h-full w-full">
      <Textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder={filePath ? `// ${filePath}` : "Select a file to view its content"}
        className="flex-grow w-full h-full p-4 rounded-md shadow-inner resize-none font-mono text-sm bg-background border-input focus:border-ring"
        aria-label="Code editor"
        readOnly={!filePath} 
      />
    </div>
  );
}
