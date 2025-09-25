// Interface para o File Explorer
export interface FileSystemNode {
  id: string;
  name: string;
  type: 'file' | 'directory';
  path: string;
  children?: FileSystemNode[];
}