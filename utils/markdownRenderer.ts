
import React from 'react';

// Enhanced Markdown Renderer Utility for "Black Hat Hacker" Theme
// Supports: H1-H3, Unordered Lists (*, -), Bold (**text**), Italic (*text*), Code blocks (```lang ... ```)

export const renderEnhancedMarkdown = (markdownText: string): React.ReactNode[] => {
  const lines = markdownText.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        React.createElement('ul', { 
          key: `list-${elements.length}`, 
          className: "list-disc list-inside my-1.5 pl-3 space-y-0.5 text-sm" 
        }, ...listItems)
      );
    }
    inList = false;
    listItems = [];
  };

  const parseInlineMarkdown = (line: string): React.ReactNode => {
    const segments: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    // Match **bold**, *italic*, and `inline code`
    const mdRegex = /(\*\*(.*?)\*\*)|(\*(.*?)\*)|(`(.*?)`)/g; 
    let match;

    while((match = mdRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
            segments.push(line.substring(lastIndex, match.index));
        }
        if (match[1]) { // Bold **text**
            segments.push(React.createElement('strong', { key: `strong-${segments.length}`, className: "text-neonGreen-light font-semibold" }, match[2]));
        } else if (match[3]) { // Italic *text*
             segments.push(React.createElement('em', { key: `em-${segments.length}`, className: "italic text-neonCyan-light" }, match[4]));
        } else if (match[5]) { // Inline code `code`
            segments.push(React.createElement('code', { key: `code-inline-${segments.length}`, className: "bg-neutral-dark px-1 py-0.5 rounded-sm text-xs text-neonMagenta-DEFAULT font-mono" }, match[6]));
        }
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < line.length) {
        segments.push(line.substring(lastIndex));
    }
    
    if (segments.length === 0) return '';
    if (segments.length === 1 && typeof segments[0] === 'string') return segments[0];

    return React.createElement(React.Fragment, {key: `frag-${Math.random().toString(36).substring(7)}`}, ...segments);
  };


  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      flushList(); 
      if (inCodeBlock) { 
        elements.push(
          React.createElement('pre', {
            key: `code-block-${elements.length}`,
            className: "bg-neutral-darkest p-2 my-1.5 rounded-sm overflow-x-auto text-xs border border-neutral-medium shadow-inner"
          }, React.createElement('code', {
              className: `language-${codeBlockLang || 'plaintext'} text-neonGreen-light` // Code block text neon green
            }, codeBlockContent.join('\n')))
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else { 
        inCodeBlock = true;
        codeBlockLang = line.substring(3).trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      flushList();
      elements.push(React.createElement('h3', {key: `h3-${elements.length}`, className: "text-base font-semibold mt-2 mb-0.5 text-neonGreen-DEFAULT"}, parseInlineMarkdown(line.substring(4))));
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      elements.push(React.createElement('h2', {key: `h2-${elements.length}`, className: "text-lg font-semibold mt-2.5 mb-1 text-neonGreen-DEFAULT"}, parseInlineMarkdown(line.substring(3))));
      continue;
    }
    if (line.startsWith("# ")) {
      flushList();
      elements.push(React.createElement('h1', {key: `h1-${elements.length}`, className: "text-xl font-bold mt-3 mb-1.5 text-neonGreen-DEFAULT"}, parseInlineMarkdown(line.substring(2))));
      continue;
    }

    // Unordered lists
    if (line.startsWith("* ") || line.startsWith("- ")) {
      if (!inList) {
        inList = true;
        listItems = []; 
      }
      listItems.push(React.createElement('li', {key: `li-${elements.length}-${listItems.length}`}, parseInlineMarkdown(line.substring(2))));
      continue;
    }

    flushList();

    if (line.trim() !== '') {
      elements.push(React.createElement('p', {key: `p-${elements.length}`, className: "my-0.5 text-sm"}, parseInlineMarkdown(line)));
    } else { 
      if (elements.length > 0) {
        const lastElement = elements[elements.length - 1];
        let isLastElementAList = false;
        if (React.isValidElement(lastElement) && lastElement.props) {
            const props = lastElement.props as { className?: string; [key: string]: any };
            if (props.className && props.className.includes('list-disc')) {
                isLastElementAList = true;
            }
        }
        if (!isLastElementAList) { 
             elements.push(React.createElement('p', { key: `p-empty-${elements.length}`, className: "my-0.5 h-2" }, "\u00A0")); 
        }
      }
    }
  }

  flushList(); 
  if (inCodeBlock) { 
     elements.push(
        React.createElement('pre', {
            key: `code-block-${elements.length}`,
            className: "bg-neutral-darkest p-2 my-1.5 rounded-sm overflow-x-auto text-xs border border-neutral-medium shadow-inner"
          }, React.createElement('code', {
              className: `language-${codeBlockLang || 'plaintext'} text-neonGreen-light`
            }, codeBlockContent.join('\n')))
      );
  }

  return elements;
};