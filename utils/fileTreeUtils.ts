
import { BlueprintFile, TreeNode } from '../types';

export const buildFileTree = (files: BlueprintFile[]): TreeNode[] => {
  const root: TreeNode = { id: 'root', name: 'root', type: 'folder', path: '', children: [] };

  files.forEach(file => {
    const parts = file.name.split('/');
    let currentNode = root;

    parts.forEach((part, index) => {
      const isFile = index === parts.length - 1;
      const currentPath = parts.slice(0, index + 1).join('/');

      let childNode = currentNode.children?.find(child => child.name === part && child.path === currentPath);

      if (!childNode) {
        childNode = {
          id: currentPath,
          name: part,
          type: isFile ? 'file' : 'folder',
          path: currentPath,
          children: isFile ? undefined : [],
          fileData: isFile ? file : undefined,
        };
        if (!currentNode.children) {
          currentNode.children = [];
        }
        currentNode.children.push(childNode);
      }
      // Ensure if a file path implies a folder that was previously a file, it gets converted (edge case, less likely with full paths)
      else if (!isFile && childNode.type === 'file') {
         childNode.type = 'folder';
         childNode.children = childNode.children || [];
         childNode.fileData = undefined; // No longer a file itself
      }
      currentNode = childNode;
    });
  });
  // Sort children at each level: folders first, then files, then alphabetically
  const sortNodes = (nodes: TreeNode[] | undefined): TreeNode[] | undefined => {
    if (!nodes) return undefined;
    nodes.forEach(node => {
      if (node.children) {
        node.children = sortNodes(node.children);
      }
    });
    return nodes.sort((a, b) => {
      if (a.type === 'folder' && b.type === 'file') return -1;
      if (a.type === 'file' && b.type === 'folder') return 1;
      return a.name.localeCompare(b.name);
    });
  };

  return sortNodes(root.children) || [];
};