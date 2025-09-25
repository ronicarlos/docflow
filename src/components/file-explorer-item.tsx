
"use client";

import type * as React from 'react';
import { useState } from 'react';
import { ChevronDown, ChevronRight, File, Folder, FolderOpen, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import type { FileSystemNode } from '@/types/FileSystem';

interface FileExplorerItemProps {
  node: FileSystemNode;
  onFileSelect: (node: FileSystemNode) => void;
  selectedFilePath: string | null;
  depth: number;
}

export function FileExplorerItem({ node, onFileSelect, selectedFilePath, depth }: FileExplorerItemProps) {
  const [isOpen, setIsOpen] = useState(depth < 1); // Open top-level directories by default

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection when toggling
    if (node.type === 'directory') {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = () => {
    if (node.type === 'file') {
      onFileSelect(node);
    } else {
      // For directories, clicking the name can also toggle
      setIsOpen(!isOpen);
    }
  };
  
  const Icon = node.type === 'directory' ? (isOpen ? FolderOpen : Folder) : FileText;
  const isSelected = node.path === selectedFilePath;
  const hasChildren = node.type === 'directory' && node.children && node.children.length > 0;

  return (
    <SidebarMenuItem className="w-full">
      <div className="flex items-center w-full group">
        {node.type === 'directory' && (
          <button
            onClick={handleToggle}
            className={cn(
              "p-1 rounded-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/20",
              hasChildren ? "opacity-100 cursor-pointer" : "opacity-0 cursor-default" // Hide if no children
            )}
            aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
            disabled={!hasChildren}
            style={{ marginLeft: `${depth * 0}px` }} // Dynamic indent removed, handled by SidebarMenuSub
          >
            {hasChildren && (isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            {!hasChildren && <span className="w-4 inline-block"></span>} 
          </button>
        )}
         {node.type === 'file' && (
            <span className="w-4 inline-block ml-1"></span> // Spacer for file icon alignment
         )}
        <SidebarMenuButton
          onClick={handleSelect}
          isActive={isSelected}
          className={cn(
            "flex-grow pl-1 text-left", // Ensure text alignment
            node.type === 'directory' && !hasChildren && "cursor-default"
          )}
          aria-current={isSelected ? 'page' : undefined}
        >
          <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
          <span className="truncate text-sm">{node.name}</span>
        </SidebarMenuButton>
      </div>
      {node.type === 'directory' && isOpen && hasChildren && (
        <SidebarMenuSub className="pl-4"> {/* Indentation for children */}
          {node.children!.map((child) => (
            <FileExplorerItem
              key={child.id}
              node={child}
              onFileSelect={onFileSelect}
              selectedFilePath={selectedFilePath}
              depth={depth + 1}
            />
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
