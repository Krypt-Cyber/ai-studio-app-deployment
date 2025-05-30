

import React, { useState } from 'react';
import { TreeNode, BlueprintFile } from '../../types';

// Icons for File Tree
const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const FileTreeFileIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25M9 17.25h6M18 17.25h.008v.008H18v-.008zm0 0H6.75M6.75 17.25H3M3 17.25V15M17.25 4.5l-4.5 4.5m0 0l-4.5-4.5m4.5 4.5V3" />
  </svg>
);

const FolderTreeOpenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 015.25 7.5h13.5a2.25 2.25 0 012.25 2.25m-16.5 0v6.75a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25v-6.75m0 0H3.75z" />
  </svg>
);

const FolderTreeClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);


interface FileTreeViewProps {
  nodes: TreeNode[];
  onFileSelect: (file: BlueprintFile) => void;
  activeFilePath: string | null;
  level?: number;
}

const FileTreeViewComponent: React.FC<FileTreeViewProps> = ({ nodes, onFileSelect, activeFilePath, level = 0 }) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderPath]: !prev[folderPath] }));
  };

  if (!nodes || nodes.length === 0) {
    return null;
  }

  return (
    <ul style={{ paddingLeft: level > 0 ? '1rem' : '0' }} className="space-y-0.5">
      {nodes.map(node => (
        <li key={node.id}>
          {node.type === 'folder' ? (
            <div>
              <button
                onClick={() => toggleFolder(node.path)}
                className="w-full text-left px-1 py-0.5 rounded-sm text-xs flex items-center text-neonGreen-light hover:bg-neonGreen-dark hover:text-neutral-darkest focus:outline-none"
                aria-expanded={!!expandedFolders[node.path]}
                aria-controls={node.children && node.children.length > 0 ? `folder-subtree-${node.id}` : undefined}
              >
                {expandedFolders[node.path] ? 
                  <ChevronDownIcon className="w-3 h-3 mr-1 flex-shrink-0 text-neonCyan-DEFAULT" /> : 
                  <ChevronRightIcon className="w-3 h-3 mr-1 flex-shrink-0 text-neonCyan-DEFAULT" />
                }
                {expandedFolders[node.path] ? 
                    <FolderTreeOpenIcon className="w-4 h-4 mr-1 flex-shrink-0" /> : 
                    <FolderTreeClosedIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                }
                {node.name}
              </button>
              {expandedFolders[node.path] && node.children && (
                <div id={`folder-subtree-${node.id}`} role="group">
                  <FileTreeViewComponent nodes={node.children} onFileSelect={onFileSelect} activeFilePath={activeFilePath} level={level + 1} />
                </div>
              )}
            </div>
          ) : ( // File
            <button
              onClick={() => node.fileData && onFileSelect(node.fileData)}
              className={`w-full text-left px-1 py-0.5 rounded-sm text-xs flex items-center truncate focus:outline-none
                ${activeFilePath === node.path
                  ? 'bg-neonGreen-DEFAULT text-neutral-darkest shadow-neon-green-glow'
                  : 'text-neonGreen-light hover:bg-neonGreen-dark hover:text-neutral-darkest'}`}
              disabled={!node.fileData}
              style={{ paddingLeft: `${0.25 + (level > 0 ? 0.25 : 0)}rem` }} // Base indent for file icon alignment
              aria-current={activeFilePath === node.path ? "page" : undefined}
            >
              <FileTreeFileIcon className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
              {node.name}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};

export const FileTreeView = React.memo(FileTreeViewComponent);
