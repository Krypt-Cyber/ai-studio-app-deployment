
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, AiProviderId, LocalLlmConfig, HuggingFaceConfig, ChatMessageImageData, AiAgentMode, GroundingSource } from '../types';
import { Button } from './ui/Button';
import { LoadingSpinner } from './LoadingSpinner';
import { AiProviderConfigurator } from './AiProviderConfigurator';
import { SelectInput, SelectOption } from './ui/SelectInput';
import { AI_AGENT_MODES } from '../constants';

// Simple Send Icon
const SendIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path d="M3.105 3.105a.5.5 0 01.707-.002l11.321 7.924a.5.5 0 010 .79l-11.32 7.924a.5.5 0 01-.707-.79l1.63-11.415L3.105 3.105z" />
  </svg>
);

const PaperClipIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3.375 3.375 0 0116.5 4.21V4.21a3.375 3.375 0 01-2.342 5.733l-7.693 7.693a2.25 2.25 0 003.182 3.182l7.693-7.693a.75.75 0 011.06 1.06l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3.375 3.375 0 0116.5 4.21V4.21a3.375 3.375 0 012.342 5.733z" />
  </svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

interface MessageContentRendererProps {
    content: string;
    sender: 'user' | 'ai';
    imageData?: ChatMessageImageData | null;
    groundingSources?: GroundingSource[] | null;
}

const MessageContentRenderer: React.FC<MessageContentRendererProps> = React.memo(({
    content,
    sender,
    imageData,
    groundingSources
}) => {
  const elements = [];
  
  if (imageData) {
    elements.push(
      <img 
        key={`img-${Date.now()}-${Math.random()}`} 
        src={`data:${imageData.mimeType};base64,${imageData.data}`} 
        alt={imageData.fileName || 'Uploaded image'} 
        className="max-w-xs max-h-64 my-2 rounded-sm border border-neutral-medium"
      />
    );
  }

  const lines = content.split('\n');
  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("```")) {
      if (inCodeBlock) { 
        elements.push(
          <pre key={`code-${elements.length}-${i}`} className="bg-neutral-darkest p-2 my-1.5 rounded-sm overflow-x-auto text-sm shadow-inner border border-neutral-dark">
            <code className={`language-${codeBlockLang || 'plaintext'} text-neonGreen-light`}>{codeBlockContent.join('\n')}</code>
          </pre>
        );
        inCodeBlock = false;
        codeBlockContent = [];
        codeBlockLang = '';
      } else { 
        inCodeBlock = true;
        codeBlockLang = line.substring(3).trim();
      }
    } else if (inCodeBlock) {
      codeBlockContent.push(line);
    } else {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, `<strong class="${sender === 'user' ? 'text-neonGreen-light' : 'text-neonCyan-light'}">$1</strong>`);
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, `<em>$1</em>`);
      formattedLine = formattedLine.replace(/`(.*?)`/g, `<code class="bg-neutral-dark px-1 py-0.5 rounded-sm text-xs text-neonMagenta-DEFAULT font-mono">$1</code>`);
      elements.push(<p key={`text-${elements.length}-${i}`} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />);
    }
  }
  if (inCodeBlock) {
     elements.push(
        <pre key={`code-${elements.length}-final`} className="bg-neutral-darkest p-2 my-1.5 rounded-sm overflow-x-auto text-sm shadow-inner border border-neutral-dark">
          <code className={`language-${codeBlockLang || 'plaintext'} text-neonGreen-light`}>{codeBlockContent.join('\n')}</code>
        </pre>
      );
  }

  if (groundingSources && groundingSources.length > 0) {
    elements.push(
      <div key="grounding-sources-container" className="mt-2 pt-1.5 border-t border-neutral-medium/50">
        <h4 className="text-xs font-semibold text-neonMagenta-light mb-1 flex items-center">
          <LinkIcon className="w-3.5 h-3.5 mr-1" />
          Retrieved Web Sources:
        </h4>
        <ul className="list-none pl-0 space-y-0.5">
          {groundingSources.map((source, index) => (
            <li key={`source-${index}`} className="text-xs truncate">
              <a
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neonMagenta-light hover:text-neonMagenta-DEFAULT hover:underline focus:outline-none focus:ring-1 focus:ring-neonMagenta-DEFAULT rounded-sm p-0.5"
                title={source.uri}
              >
                {source.title || source.uri}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  return elements.length > 0 ? <>{elements}</> : <p className="text-sm leading-relaxed italic text-neutral-medium">[Empty Message or Image Only]</p>;
});


interface PendingImage {
  dataUrl: string;
  mimeType: string;
  data: string;
  fileName: string;
}

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, imageData?: ChatMessageImageData | null, agentMode?: AiAgentMode, selectedCode?: string | null) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  currentProviderName: string; 
  selectedAiProvider: AiProviderId; 
  setSelectedAiProvider: (id: AiProviderId) => void; 
  localLlmConfig: LocalLlmConfig;
  setLocalLlmConfig: (config: LocalLlmConfig | ((prevState: LocalLlmConfig) => LocalLlmConfig)) => void;
  huggingFaceConfig: HuggingFaceConfig;
  setHuggingFaceConfig: (config: HuggingFaceConfig | ((prevState: HuggingFaceConfig) => HuggingFaceConfig)) => void;
  isEmbedded?: boolean; 
  selectedCodeFromEditor?: string | null;
  onClearChatHistory?: () => void; 
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  error,
  currentProviderName, 
  selectedAiProvider,
  setSelectedAiProvider,
  localLlmConfig,
  setLocalLlmConfig,
  huggingFaceConfig,
  setHuggingFaceConfig,
  isEmbedded = false,
  selectedCodeFromEditor,
  onClearChatHistory, 
}) => {
  const [userInput, setUserInput] = useState('');
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [currentAiAgentMode, setCurrentAiAgentMode] = useState<AiAgentMode>('default');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);
  
  const currentModeConfig = AI_AGENT_MODES.find(m => m.id === currentAiAgentMode) || AI_AGENT_MODES[0];
  let chatInputPlaceholder = currentModeConfig.placeholder || 'Transmit query to AI Agent...';
  if (selectedCodeFromEditor && currentAiAgentMode !== 'default' && currentAiAgentMode !== 'command_oracle' && currentAiAgentMode !== 'research_oracle') {
     chatInputPlaceholder = `Code context active. ${currentModeConfig.placeholder || 'Describe task for selection...'}`;
  } else if (selectedCodeFromEditor && (currentAiAgentMode === 'default' || currentAiAgentMode === 'command_oracle' || currentAiAgentMode === 'research_oracle')) {
     chatInputPlaceholder = `Code context active. ${chatInputPlaceholder}`;
  }


  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setPendingImage({
          dataUrl: reader.result as string,
          mimeType: file.type,
          data: base64String,
          fileName: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
    if (event.target) {
        event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removePendingImage = () => {
    setPendingImage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userInput.trim() || pendingImage) {
      const imagePayload = pendingImage 
        ? { mimeType: pendingImage.mimeType, data: pendingImage.data, fileName: pendingImage.fileName } 
        : null;
      onSendMessage(userInput, imagePayload, currentAiAgentMode, selectedCodeFromEditor);
      setUserInput('');
      setPendingImage(null);
    }
  };
  
  const containerClasses = isEmbedded
    ? "flex flex-col h-full bg-neutral-darker overflow-hidden border-l-2 border-neutral-dark" 
    : "flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto bg-neutral-darker shadow-2xl rounded-md overflow-hidden border-2 border-neutral-dark";

  const canUploadImage = selectedAiProvider === 'gemini';
  const agentModeOptions: SelectOption[] = AI_AGENT_MODES.map(mode => ({ value: mode.id, label: mode.label }));

  return (
    <div className={containerClasses}>
      <header className={`p-3 border-b-2 border-neutral-dark ${isEmbedded ? 'pt-2 pb-2' : ''}`}>
        <div className="flex justify-between items-center">
            <h2 className={`font-bold text-neonGreen-DEFAULT ${isEmbedded ? 'text-base' : 'text-lg'}`}>AI AGENT COMMS</h2>
            {onClearChatHistory && !isEmbedded && ( 
                <Button onClick={onClearChatHistory} variant="stealth" size="sm" className="text-xs border-neonMagenta-DEFAULT text-neonMagenta-light hover:bg-neonMagenta-dark hover:text-black">
                    CLEAR LOG
                </Button>
            )}
        </div>

        {!isEmbedded && <p className="text-xs text-neonCyan-light">Global Uplink: {currentProviderName}</p>}
         <div className="mt-1.5 space-y-2">
            <AiProviderConfigurator
                selectedAiProvider={selectedAiProvider}
                setSelectedAiProvider={setSelectedAiProvider}
                localLlmConfig={localLlmConfig}
                setLocalLlmConfig={setLocalLlmConfig}
                huggingFaceConfig={huggingFaceConfig}
                setHuggingFaceConfig={setHuggingFaceConfig}
                idPrefix={isEmbedded ? "chat-embedded-ai-config" : "chat-standalone-ai-config"}
            />
            <SelectInput
              id={isEmbedded ? "chat-embedded-agent-mode" : "chat-standalone-agent-mode"}
              label="Agent Protocol:"
              options={agentModeOptions}
              value={currentAiAgentMode}
              onChange={(value) => setCurrentAiAgentMode(value as AiAgentMode)}
              className="text-xs"
            />
        </div>
      </header>

      <div className="flex-grow p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-medium scrollbar-track-neutral-dark">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] p-2.5 rounded-md shadow-md border ${
                msg.sender === 'user'
                  ? 'bg-neutral-dark border-neonGreen-DEFAULT text-neonGreen-light' 
                  : 'bg-neutral-dark border-neonCyan-DEFAULT text-neonCyan-light' 
              }`}
            >
              {msg.isLoading ? (
                <div role="status" aria-live="polite">
                  <LoadingSpinner size="sm" color="border-neonGreen-DEFAULT" />
                  <span className="sr-only">AI is processing your request.</span>
                </div>
              ) : (
                <MessageContentRenderer 
                    content={msg.content} 
                    sender={msg.sender} 
                    imageData={msg.imageData} 
                    groundingSources={msg.groundingSources}
                />
              )}
              <p className={`text-xs mt-1.5 ${msg.sender === 'user' ? 'text-neonGreen-dark text-right' : 'text-neonCyan-dark text-left'}`}>
                {msg.sender === 'ai' ? (msg.aiProviderName || currentProviderName) : 'Operator'} - {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div role="alert" aria-live="assertive" className="p-2.5 border-t-2 border-neonMagenta-dark bg-neonMagenta-DEFAULT/20 text-neonMagenta-light text-xs">
          <strong>SYSTEM ALERT:</strong> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-3 border-t-2 border-neutral-dark bg-neutral-darkest">
        {pendingImage && (
          <div className="mb-2 p-1.5 border border-neutral-medium rounded-sm bg-neutral-dark flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <img src={pendingImage.dataUrl} alt="Preview" className="h-8 w-8 object-cover rounded-sm border border-neutral-medium" />
              <span className="text-xs text-neutral-light truncate max-w-[150px] sm:max-w-xs">{pendingImage.fileName}</span>
            </div>
            <Button onClick={removePendingImage} variant="danger" size="sm" className="p-1 text-xs" aria-label="Remove image">
              <XCircleIcon className="w-4 h-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/webp"
            aria-label="Upload image file"
          />
          <Button 
            type="button" 
            onClick={triggerFileInput} 
            disabled={isLoading || !canUploadImage || currentAiAgentMode === 'research_oracle'}
            variant="outline" 
            size="md" 
            className={`p-2 ${canUploadImage && currentAiAgentMode !== 'research_oracle' ? 'border-neonGreen-DEFAULT text-neonGreen-DEFAULT hover:bg-neonGreen-DEFAULT hover:text-black' : 'border-neutral-medium text-neutral-medium cursor-not-allowed'}`}
            title={canUploadImage && currentAiAgentMode !== 'research_oracle' ? "Attach Data Packet (Image)" : (currentAiAgentMode === 'research_oracle' ? "Image uplink disabled for Research Oracle mode" : "Image uplink available only for Gemini Node (non-research modes)")}
            aria-label="Attach image for AI processing"
          >
            <PaperClipIcon className="w-5 h-5" />
          </Button>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={chatInputPlaceholder}
            aria-label="Chat input message"
            className="flex-grow px-3 py-2 bg-neutral-dark border border-neutral-medium rounded-sm shadow-sm placeholder-neutral-medium focus:outline-none focus:ring-2 focus:ring-neonGreen-DEFAULT focus:border-neonGreen-DEFAULT text-neonGreen-light sm:text-sm"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || (!userInput.trim() && !pendingImage)} variant="primary" size="md" className="p-2 shadow-neon-green-glow" aria-label="Send message to AI">
            {isLoading ? <LoadingSpinner size="sm" color="border-black"/> : <SendIcon className="w-5 h-5 text-black"/>}
          </Button>
        </div>
      </form>
    </div>
  );
};
