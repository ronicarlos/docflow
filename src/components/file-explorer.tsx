
"use client";

import type * as React from 'react';
import { SidebarMenu } from '@/components/ui/sidebar';
import type { FileSystemNode } from '@/types/FileSystem';
import { FileExplorerItem } from './file-explorer-item';

interface FileExplorerProps {
  nodes: FileSystemNode[];
  onFileSelect: (node: FileSystemNode) => void;
  selectedFilePath: string | null;
}

export function FileExplorer({ nodes, onFileSelect, selectedFilePath }: FileExplorerProps) {
  return (
    <SidebarMenu className="p-1 space-y-0.5">
      {nodes.map((node) => (
        <FileExplorerItem
          key={node.id}
          node={node}
          onFileSelect={onFileSelect}
          selectedFilePath={selectedFilePath}
          depth={0}
        />
      ))}
    </SidebarMenu>
  );
}
