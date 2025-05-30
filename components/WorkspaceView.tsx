
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-swift';
import 'prismjs/components/prism-kotlin';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-docker';
import 'prismjs/components/prism-bash';


import { ParsedBlueprint, BlueprintFile, ChatMessage, AiProviderId, LocalLlmConfig, HuggingFaceConfig, ChatMessageImageData, AiAgentMode, TreeNode } from '../types';
import { ChatView } from './ChatView';
import { Button } from './ui/Button';
import { LoadingSpinner } from './LoadingSpinner';
// import { renderEnhancedMarkdown } from '../utils/markdownRenderer'; // Keep for blueprint overview if needed
import { buildFileTree } from '../utils/fileTreeUtils'; 
import { FileTreeView } from './ui/FileTreeView'; 
import { AddNewFileModal } from './ui/AddNewFileModal'; 
import JSZip from 'jszip';

// Icons for UI elements
const FolderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const PlusCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClipboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
  </svg>
);

const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.663V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.16a2.25 2.25 0 00-.1-.662L19.24 5.338a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
    </svg>
);


const languageMap: Record<string, Prism.Grammar | undefined> = {
  javascript: Prism.languages.javascript,
  jsx: Prism.languages.jsx,
  typescript: Prism.languages.typescript,
  tsx: Prism.languages.tsx,
  python: Prism.languages.python,
  json: Prism.languages.json,
  html: Prism.languages.markup,
  xml: Prism.languages.markup,
  css: Prism.languages.css,
  markdown: Prism.languages.markdown,
  sql: Prism.languages.sql,
  java: Prism.languages.java,
  csharp: Prism.languages.csharp,
  go: Prism.languages.go,
  ruby: Prism.languages.ruby,
  rust: Prism.languages.rust,
  swift: Prism.languages.swift,
  kotlin: Prism.languages.kotlin,
  yaml: Prism.languages.yaml,
  dockerfile: Prism.languages.docker,
  bash: Prism.languages.bash,
  shell: Prism.languages.bash,
  clike: Prism.languages.clike, // Default for unknown C-family
  // Add more mappings as needed
};

const getPrismLanguage = (langIdentifier: string | undefined): Prism.Grammar => {
  if (!langIdentifier) return Prism.languages.clike; // Default to clike for plain text or unknown
  const lowerLang = langIdentifier.toLowerCase();
  return languageMap[lowerLang] || Prism.languages.clike;
};


interface WorkspaceViewProps {
  blueprint: ParsedBlueprint;
  projectName: string;
  chatMessages: ChatMessage[];
  onSendChatMessage: (message: string, imageData?: ChatMessageImageData | null, agentMode?: AiAgentMode, selectedCode?: string | null) => Promise<void>;
  isChatLoading: boolean;
  chatError: string | null;
  currentChatProviderName: string;
  selectedAiProvider: AiProviderId;
  setSelectedAiProvider: (id: AiProviderId) => void;
  localLlmConfig: LocalLlmConfig;
  setLocalLlmConfig: (config: LocalLlmConfig | ((prevState: LocalLlmConfig) => LocalLlmConfig)) => void;
  huggingFaceConfig: HuggingFaceConfig;
  setHuggingFaceConfig: (config: HuggingFaceConfig | ((prevState: HuggingFaceConfig) => HuggingFaceConfig)) => void;
  onExitWorkspace: () => void;
  setCurrentBlueprint: (blueprint: ParsedBlueprint | null | ((prevState: ParsedBlueprint | null) => ParsedBlueprint | null)) => void;
  onClearChatHistory?: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  blueprint,
  projectName,
  chatMessages,
  onSendChatMessage,
  isChatLoading,
  chatError,
  currentChatProviderName,
  selectedAiProvider,
  setSelectedAiProvider,
  localLlmConfig,
  setLocalLlmConfig,
  huggingFaceConfig,
  setHuggingFaceConfig,
  onExitWorkspace,
  setCurrentBlueprint,
  onClearChatHistory,
}) => {
  const [activeFile, setActiveFile] = useState<BlueprintFile | null>(null);
  const [editorContent, setEditorContent] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [selectedEditorText, setSelectedEditorText] = useState<string | null>(null);
  const editorRef = useRef<any>(null); // For react-simple-code-editor, ref might give access to textarea
  const [fileTree, setFileTree] = useState<TreeNode[]>([]);
  const [isAddNewFileModalOpen, setIsAddNewFileModalOpen] = useState(false);


  useEffect(() => {
    setFileTree(buildFileTree(blueprint.suggestedFiles));
  }, [blueprint.suggestedFiles]);

  const findInitialActiveFile = useCallback((nodes: TreeNode[]): BlueprintFile | null => {
    for (const node of nodes) {
        if (node.type === 'file' && node.fileData) return node.fileData;
        if (node.type === 'folder' && node.children) {
            const foundInChild = findInitialActiveFile(node.children);
            if (foundInChild) return foundInChild;
        }
    }
    if (blueprint.suggestedFiles.length > 0) return blueprint.suggestedFiles[0];
    return null;
  }, [blueprint.suggestedFiles]);


  useEffect(() => {
    if (blueprint.suggestedFiles.length > 0) {
      const currentActiveFileStillExists = activeFile && blueprint.suggestedFiles.some(f => f.name === activeFile.name);
      if (currentActiveFileStillExists && activeFile) {
        const updatedBlueprintFile = blueprint.suggestedFiles.find(f => f.name === activeFile.name);
        if (updatedBlueprintFile && updatedBlueprintFile.content !== activeFile.content) {
          if (!hasUnsavedChanges) {
            setEditorContent(updatedBlueprintFile.content);
          }
          setActiveFile(updatedBlueprintFile); 
        }
      } else {
        const newActive = findInitialActiveFile(fileTree);
        if (newActive) {
          setActiveFile(newActive);
          setEditorContent(newActive.content);
          setHasUnsavedChanges(false);
          setSelectedEditorText(null);
        } else {
          setActiveFile(null);
          setEditorContent('');
          setHasUnsavedChanges(false);
          setSelectedEditorText(null);
        }
      }
    } else {
      setActiveFile(null);
      setEditorContent('');
      setHasUnsavedChanges(false);
      setSelectedEditorText(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [blueprint.suggestedFiles, fileTree, findInitialActiveFile]); 
  
  const handleFileSelect = (file: BlueprintFile) => {
    if (hasUnsavedChanges && activeFile) {
      if (!window.confirm(`UNSAVED CHANGES DETECTED in ${activeFile.name}. Discard and switch file?`)) {
        return;
      }
    }
    setActiveFile(file);
    setEditorContent(file.content);
    setHasUnsavedChanges(false);
    setSelectedEditorText(null);
  };

  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    if (activeFile && newContent !== activeFile.content) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  };

  const handleSaveFile = () => {
    if (activeFile && hasUnsavedChanges) {
      setCurrentBlueprint(prevBlueprint => {
        if (!prevBlueprint) return null;
        const updatedFiles = prevBlueprint.suggestedFiles.map(f =>
          f.name === activeFile.name ? { ...f, content: editorContent } : f
        );
        return { ...prevBlueprint, suggestedFiles: updatedFiles };
      });
      setActiveFile(prevActiveFile => prevActiveFile ? {...prevActiveFile, content: editorContent} : null);
      setHasUnsavedChanges(false);
      alert(`File ${activeFile.name} modifications saved to current blueprint session.`);
    }
  };

  const handleExportProject = async () => {
    setIsExporting(true);
    setExportError(null);
    try {
      const zip = new JSZip();
      
      let filesToZip = blueprint.suggestedFiles;
      if (activeFile && hasUnsavedChanges) {
         if(window.confirm(`File ${activeFile.name} has unsaved changes. Save them before exporting?`)) {
            filesToZip = blueprint.suggestedFiles.map(f =>
                f.name === activeFile.name ? { ...f, content: editorContent } : f
            );
            setActiveFile(prev => prev ? {...prev, content: editorContent} : null);
            setHasUnsavedChanges(false);
             setCurrentBlueprint(prevBlueprint => {
                if (!prevBlueprint) return null;
                return { ...prevBlueprint, suggestedFiles: filesToZip };
             });
         }
      }

      filesToZip.forEach(file => {
        zip.file(file.name, file.content);
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = `${projectName.replace(/\s+/g, '_') || 'Projekt_Ckryptbit_Blueprint'}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      alert('Project blueprint archive download initiated.');
    } catch (err) {
      console.error("Export error:", err);
      const message = err instanceof Error ? err.message : "Unknown error during archive generation.";
      setExportError(message);
      alert(`Archive generation failure: ${message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (activeFile && editorContent) {
      navigator.clipboard.writeText(editorContent)
        .then(() => alert(`${activeFile.name} content copied to clipboard.`))
        .catch(err => alert(`Failed to copy: ${err.message}`));
    }
  };

  const handleEditorSelection = () => {
    // react-simple-code-editor uses a textarea internally or contentEditable div
    // We can use standard window.getSelection() or properties of the textarea if accessible via ref
    const currentEditor = editorRef.current?._input; // Access internal textarea if possible (implementation detail)
    if (currentEditor && typeof currentEditor.selectionStart === 'number' && typeof currentEditor.selectionEnd === 'number') {
         const text = currentEditor.value.substring(currentEditor.selectionStart, currentEditor.selectionEnd);
         setSelectedEditorText(text.length > 0 ? text : null);
    } else {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            setSelectedEditorText(selection.toString());
        } else {
            setSelectedEditorText(null);
        }
    }
  };
  
  const handleAddNewFileViaAI = (filePath: string, description?: string) => {
    setIsAddNewFileModalOpen(false); 
    const command = `SYSTEM_COMMAND: Create a new file named "${filePath}". ${description ? `The file's purpose is: "${description}". Please generate suitable initial content for it, inferring the language if possible from the extension or purpose.` : 'Please generate some basic boilerplate content for this new file, inferring the language from its extension.'} Ensure your response is a 'fileOperation' JSON object.`;
    onSendChatMessage(command, null, 'default', null)
      .then(() => {})
      .catch(err => {
        console.error("Error sending 'add file' command to AI:", err);
        alert(`Failed to send 'add file' command to AI: ${err.message}`);
      });
  };


  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-150px)] bg-neutral-darker border-2 border-neutral-dark rounded-md shadow-2xl overflow-hidden">
      {/* File Explorer Pane */}
      <div className="w-full md:w-1/4 lg:w-1/5 p-3 border-r-2 border-neutral-dark overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-medium scrollbar-track-neutral-dark">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-neutral-medium">
            <h3 className="text-sm font-semibold text-neonGreen-DEFAULT flex items-center">
            <FolderIcon className="w-4 h-4 mr-1.5" />
            BLUEPRINT FILES
            </h3>
            <Button 
                onClick={() => setIsAddNewFileModalOpen(true)}
                variant="stealth" 
                size="sm" 
                className="p-0.5 text-neonCyan-light hover:text-neonCyan-DEFAULT"
                title="Add New File (AI Assisted)"
                aria-label="Add New File (AI Assisted)"
            >
                <PlusCircleIcon className="w-5 h-5"/>
            </Button>
        </div>
        <FileTreeView nodes={fileTree} onFileSelect={handleFileSelect} activeFilePath={activeFile?.name || null} />
      </div>

      {/* Editor and Details Pane */}
      <div className="flex-grow flex flex-col md:w-3/4 lg:w-4/5">
        {activeFile ? (
          <>
            <div className="p-2.5 border-b-2 border-neutral-dark bg-neutral-darkest flex flex-wrap justify-between items-center">
              <h4 className="text-sm font-semibold text-neonCyan-light truncate mr-2" title={activeFile.name}>{activeFile.name}</h4>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-1.5 py-0.5 rounded-sm ${hasUnsavedChanges ? 'bg-neonMagenta-DEFAULT text-black animate-pulse' : 'bg-neutral-medium text-neutral-darkest'}`}>
                  {hasUnsavedChanges ? 'MODIFIED' : 'SYNCED'}
                </span>
                <Button onClick={handleSaveFile} variant="outline" size="sm" disabled={!hasUnsavedChanges} className="text-xs px-1.5 py-0.5" aria-label={`Save changes to ${activeFile.name}`}>
                  <SaveIcon className="w-3.5 h-3.5 mr-1"/>SAVE
                </Button>
                <Button onClick={handleCopyToClipboard} variant="stealth" size="sm" className="text-xs px-1.5 py-0.5" aria-label={`Copy content of ${activeFile.name} to clipboard`}>
                  <ClipboardIcon className="w-3.5 h-3.5 mr-1"/>COPY
                </Button>
              </div>
            </div>
            <Editor
              ref={editorRef}
              value={editorContent}
              onValueChange={handleEditorChange}
              highlight={code => Prism.highlight(code, getPrismLanguage(activeFile?.language), activeFile?.language || 'clike')}
              padding={12} // p-3 equivalent
              className="code-editor-wrapper" // Custom class for styling (font, bg, scrollbar)
              textareaClassName="focus:outline-none" // class for underlying textarea
              preClassName="focus:outline-none" // class for pre element
              onMouseUp={handleEditorSelection}
              onBlur={handleEditorSelection}
              placeholder={`// ${activeFile.language} code for ${activeFile.name}`}
              spellCheck="false"
              aria-label={`Code editor for ${activeFile.name}`}
              // style prop can be used for direct styling if needed, but class is preferred for theme consistency
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: '0.75rem', // text-xs
                backgroundColor: '#0A0A0A', // neutral-darkest
                color: '#00FF00', // neonGreen-light (default text color, Prism overrides for syntax)
                lineHeight: 1.5,
              }}
            />
          </>
        ) : (
          <div className="flex-grow flex items-center justify-center p-4 text-center">
            <div>
                <FolderIcon className="w-12 h-12 text-neutral-medium mx-auto mb-2" />
                <p className="text-neutral-medium text-sm">No file selected or blueprint is empty.</p>
                <p className="text-xs text-neutral-dark mt-1">Select a file from the explorer or use AI to generate one.</p>
            </div>
          </div>
        )}
         <div className="p-2 bg-neutral-darkest border-t-2 border-neutral-dark flex justify-between items-center">
            <p className="text-xs text-neonCyan-light">
            {projectName} // Lines: {editorContent.split('\n').length} // Chars: {editorContent.length}
            {selectedEditorText && <span className="ml-2 text-neonMagenta-light"> // Selected: {selectedEditorText.length} chars</span>}
            </p>
            <Button 
                onClick={() => setShowChat(!showChat)} 
                variant="stealth" 
                size="sm" 
                className="text-xs"
                aria-label={showChat ? 'Hide AI Communications Panel' : 'Show AI Communications Panel'}
                aria-expanded={showChat}
            >
                {showChat ? 'HIDE AI COMMS' : 'SHOW AI COMMS'}
            </Button>
        </div>
      </div>

      {/* Chat Pane (Collapsible) */}
      {showChat && (
        <div className="w-full md:w-1/3 lg:w-1/4 border-l-2 border-neutral-dark flex flex-col">
          <ChatView
            messages={chatMessages}
            onSendMessage={onSendChatMessage}
            isLoading={isChatLoading}
            error={chatError}
            currentProviderName={currentChatProviderName}
            selectedAiProvider={selectedAiProvider}
            setSelectedAiProvider={setSelectedAiProvider}
            localLlmConfig={localLlmConfig}
            setLocalLlmConfig={setLocalLlmConfig}
            huggingFaceConfig={huggingFaceConfig}
            setHuggingFaceConfig={setHuggingFaceConfig}
            isEmbedded={true}
            selectedCodeFromEditor={selectedEditorText}
            onClearChatHistory={onClearChatHistory}
          />
        </div>
      )}
      
      {/* Action Footer */}
      <div className="w-full p-2.5 border-t-2 border-neutral-dark bg-neutral-darkest flex flex-wrap justify-between items-center fixed bottom-0 left-0 right-0 md:relative">
        <div className="text-sm text-neonGreen-light truncate max-w-[200px] sm:max-w-xs md:max-w-sm" title={blueprint.overview}>
          Blueprint: {blueprint.overview.substring(0,50)}...
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={handleExportProject} 
            variant="primary" 
            size="sm" 
            isLoading={isExporting} 
            className="shadow-neon-green-glow"
            aria-label="Export current project blueprint as a ZIP archive"
          >
            <DownloadIcon className="w-4 h-4 mr-1.5"/>
            EXPORT BLUEPRINT
          </Button>
          <Button 
            onClick={onExitWorkspace} 
            variant="danger" 
            size="sm"
            aria-label="Exit current workspace and return to architect view"
          >
            TERMINATE WORKSPACE
          </Button>
        </div>
        {exportError && <p className="w-full text-center text-xs text-neonMagenta-DEFAULT mt-1" role="alert">{exportError}</p>}
      </div>
      
      <AddNewFileModal 
        isOpen={isAddNewFileModalOpen}
        onClose={() => setIsAddNewFileModalOpen(false)}
        onSubmit={handleAddNewFileViaAI}
      />

    </div>
  );
};
