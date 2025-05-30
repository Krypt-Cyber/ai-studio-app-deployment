
import React, { useState, useCallback, useEffect } from 'react';
import { TechCategorySelector } from './TechCategorySelector';
import { LoadingSpinner } from './LoadingSpinner';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';
import { WorkspaceView } from './WorkspaceView'; 
import { SelectedTechnologies, TechCategoryKey, AiProviderId, LocalLlmConfig, HuggingFaceConfig, ParsedBlueprint, ChatMessage, FileOperation, ChatMessageImageData, AiAgentMode } from '../types';
import { CATEGORY_ORDER, TECHNOLOGY_OPTIONS, AI_PROVIDER_OPTIONS } from '../constants';
import { generateStackOverviewWithGemini } from '../services/geminiService';
import { generateStackOverviewWithLocalLlm } from '../services/localLlmService';
import { generateStackOverviewWithHuggingFace } from '../services/huggingFaceService';
import { AiProviderConfigurator } from './AiProviderConfigurator'; 


const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 13.75l-1.25-1.75a4.5 4.5 0 00-3.09-3.09L11.25 6l1.75 1.25.25.188 1.5 1.06a4.5 4.5 0 003.09 3.09L20.75 12l-1.75.25-.25.188-1.5 1.06a4.5 4.5 0 00-3.09 3.09L12.75 18l1.25-1.75.25-.188 1.5-1.06a4.5 4.5 0 003.09-3.09z" />
  </svg>
);

interface TechStackConfiguratorViewProps {
  selectedAiProvider: AiProviderId;
  setSelectedAiProvider: (id: AiProviderId) => void;
  localLlmConfig: LocalLlmConfig;
  setLocalLlmConfig: (config: LocalLlmConfig | ((prevState: LocalLlmConfig) => LocalLlmConfig)) => void;
  huggingFaceConfig: HuggingFaceConfig;
  setHuggingFaceConfig: (config: HuggingFaceConfig | ((prevState: HuggingFaceConfig) => HuggingFaceConfig)) => void;
  
  chatMessages: ChatMessage[];
  onSendChatMessage: (message: string, imageData?: ChatMessageImageData | null, agentMode?: AiAgentMode, selectedCode?: string | null) => Promise<void>;
  isChatLoading: boolean;
  chatError: string | null;
  currentChatProviderName: string;

  currentBlueprint: ParsedBlueprint | null;
  setCurrentBlueprint: (blueprint: ParsedBlueprint | null | ((prevState: ParsedBlueprint | null) => ParsedBlueprint | null)) => void;
  onApplyFileOpsToBlueprint: (fileOps: FileOperation[]) => void; 
  onClearChatHistory?: () => void;
}

export const TechStackConfiguratorView: React.FC<TechStackConfiguratorViewProps> = ({
  selectedAiProvider,
  setSelectedAiProvider,
  localLlmConfig,
  setLocalLlmConfig,
  huggingFaceConfig,
  setHuggingFaceConfig,
  chatMessages,
  onSendChatMessage, // This will be used by WorkspaceView's embedded chat
  isChatLoading,
  chatError,
  currentChatProviderName,
  currentBlueprint,
  setCurrentBlueprint,
  onApplyFileOpsToBlueprint, // Not used directly here, but WorkspaceView might if chat is used for file ops
  onClearChatHistory,
}) => {
  const [projectName, setProjectName] = useState<string>('');
  const [selections, setSelections] = useState<Partial<Record<TechCategoryKey, string>>>({});
  const [isBlueprintLoading, setIsBlueprintLoading] = useState<boolean>(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);

  const handleTechSelectionChange = useCallback((categoryKey: TechCategoryKey, optionId: string) => {
    setSelections(prev => ({ ...prev, [categoryKey]: optionId }));
  }, []);

  const handleAiProviderSelectionChange = useCallback((providerId: AiProviderId) => {
    setSelectedAiProvider(providerId);
    setSelections(prev => ({ ...prev, AI_PROVIDER: providerId }));
  }, [setSelectedAiProvider]);
  
  useEffect(() => {
    if (selectedAiProvider && selections.AI_PROVIDER !== selectedAiProvider) {
      setSelections(prev => ({ ...prev, AI_PROVIDER: selectedAiProvider }));
    } else if (!selectedAiProvider && AI_PROVIDER_OPTIONS.length > 0) {
      const defaultProvider = AI_PROVIDER_OPTIONS.find(p => p.id === 'gemini') || AI_PROVIDER_OPTIONS[0];
      if (defaultProvider) {
        setSelectedAiProvider(defaultProvider.id as AiProviderId);
        setSelections(prev => ({ ...prev, AI_PROVIDER: defaultProvider.id }));
      }
    }
  }, [selectedAiProvider, setSelectedAiProvider, selections]);


  const getOptionNameById = (categoryId: TechCategoryKey, optionId: string): string | undefined => {
    if (categoryId === 'AI_PROVIDER') {
      return AI_PROVIDER_OPTIONS.find(opt => opt.id === optionId)?.name;
    }
    return TECHNOLOGY_OPTIONS[categoryId as Exclude<TechCategoryKey, 'AI_PROVIDER'>]?.find(opt => opt.id === optionId)?.name;
  };

  const handleSubmit = async () => {
    setIsBlueprintLoading(true);
    setBlueprintError(null);
    setCurrentBlueprint(null); 

    const aiProviderName = getOptionNameById("AI_PROVIDER", selections.AI_PROVIDER || selectedAiProvider);

    const fullSelections: SelectedTechnologies = {
      projectName: projectName || "Project_Stealth", 
      FRONTEND: getOptionNameById("FRONTEND", selections.FRONTEND || ''),
      UI_LIBRARY: getOptionNameById("UI_LIBRARY", selections.UI_LIBRARY || ''),
      BACKEND: getOptionNameById("BACKEND", selections.BACKEND || ''),
      DATABASE: getOptionNameById("DATABASE", selections.DATABASE || ''),
      AI_PROVIDER_NAME: aiProviderName, 
      DEPLOYMENT: getOptionNameById("DEPLOYMENT", selections.DEPLOYMENT || ''),
    };
    
    const cleanedSelections = Object.entries(fullSelections).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            acc[key as keyof SelectedTechnologies] = value;
        }
        return acc;
    }, {} as SelectedTechnologies);

    try {
      let blueprintData: ParsedBlueprint;
      const currentSelectedProviderForBlueprint = selections.AI_PROVIDER || selectedAiProvider;

      switch (currentSelectedProviderForBlueprint) {
        case 'gemini':
          if (!process.env.API_KEY) {
            throw new Error("CRITICAL: Google Gemini API key (API_KEY) is not set. System compromised if this persists.");
          }
          blueprintData = await generateStackOverviewWithGemini(cleanedSelections);
          break;
        case 'local_llm':
          if (!localLlmConfig.baseUrl || !localLlmConfig.modelName) {
            throw new Error("Local LLM endpoint and model identifier are mandatory.");
          }
          blueprintData = await generateStackOverviewWithLocalLlm(cleanedSelections, localLlmConfig.baseUrl, localLlmConfig.modelName);
          break;
        case 'huggingface':
          if (!huggingFaceConfig.modelId) {
            throw new Error("Hugging Face Model ID is required for node access.");
          }
          blueprintData = await generateStackOverviewWithHuggingFace(cleanedSelections, huggingFaceConfig.modelId, huggingFaceConfig.apiKey);
          break;
        default:
           throw new Error("No valid AI uplink detected or configured for blueprint generation.");
      }
      setCurrentBlueprint(blueprintData); 
    } catch (err) {
      console.error("Blueprint generation failure:", err);
      const message = err instanceof Error ? err.message : "Unknown system error during blueprint synthesis.";
      setBlueprintError(message);
      if (message.toLowerCase().includes("failed to parse json") || message.toLowerCase().includes("invalid json structure")) {
          setBlueprintError(`AI data matrix corrupted. Unable to process blueprint. Details: ${message}`);
      }
    } finally {
      setIsBlueprintLoading(false);
    }
  };
  
  const handleExitWorkspace = () => {
    if (currentBlueprint) {
        const unsavedChangesExist = currentBlueprint.suggestedFiles.some(file => {
           // This logic might need to compare against a snapshot or track edit states
           // For now, assume a simple check or remove if not fully implemented
           // to avoid preventing exit unnecessarily.
           // Example: if (file.hasLocalUnsavedChanges) return true;
           return false; 
        });

        if (unsavedChangesExist && !window.confirm("You have unsaved changes in the workspace. Are you sure you want to exit and lose them?")) {
            return;
        }
    }
    setCurrentBlueprint(null); 
  };


  if (currentBlueprint) { 
    return (
      <WorkspaceView
        blueprint={currentBlueprint}
        projectName={projectName || "Project_Stealth"}
        chatMessages={chatMessages}
        onSendChatMessage={onSendChatMessage} 
        isChatLoading={isChatLoading} 
        chatError={chatError}
        currentChatProviderName={currentChatProviderName}
        selectedAiProvider={selectedAiProvider}
        setSelectedAiProvider={setSelectedAiProvider}
        localLlmConfig={localLlmConfig}
        setLocalLlmConfig={setLocalLlmConfig}
        huggingFaceConfig={huggingFaceConfig}
        setHuggingFaceConfig={setHuggingFaceConfig}
        onExitWorkspace={handleExitWorkspace}
        setCurrentBlueprint={setCurrentBlueprint} 
        onClearChatHistory={onClearChatHistory}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto font-mono">
      <section className="mb-10 p-4 sm:p-6 bg-neutral-darker shadow-2xl rounded-md border-2 border-neutral-dark">
        <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-neonGreen-DEFAULT">SYSTEM CONFIGURATION INTERFACE</h2>
        <TextInput
          label="Project Codename (Optional)"
          id="projectName"
          value={projectName}
          onChange={setProjectName}
          placeholder="e.g., Project_Chimera"
          className="mb-6"
        />
        <div className="space-y-4">
          {CATEGORY_ORDER.map(category => {
            if (category.key === 'AI_PROVIDER') {
              return (
                <div key={category.key} className="p-3 border border-neutral-medium rounded-sm bg-neutral-darkest shadow-sm">
                   <AiProviderConfigurator
                      selectedAiProvider={selectedAiProvider}
                      setSelectedAiProvider={handleAiProviderSelectionChange}
                      localLlmConfig={localLlmConfig}
                      setLocalLlmConfig={setLocalLlmConfig}
                      huggingFaceConfig={huggingFaceConfig}
                      setHuggingFaceConfig={setHuggingFaceConfig}
                      idPrefix="architect-ai-config"
                   />
                </div>
              );
            }
            return (
              <div key={category.key}>
                <TechCategorySelector
                  categoryKey={category.key}
                  categoryLabel={category.label}
                  options={TECHNOLOGY_OPTIONS[category.key as Exclude<TechCategoryKey, 'AI_PROVIDER'>]}
                  selectedValue={selections[category.key] || ''}
                  onSelect={handleTechSelectionChange}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-8 text-center">
          <Button onClick={handleSubmit} disabled={isBlueprintLoading || !selectedAiProvider} variant="primary" size="lg" className="shadow-neon-green-glow">
            {isBlueprintLoading ? (
              <LoadingSpinner size="sm" color="border-neutral-darkest" />
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 mr-2 text-neutral-darkest" />
                INITIATE BLUEPRINT GENERATION
              </>
            )}
          </Button>
           {!selectedAiProvider && <p className="text-neonMagenta-DEFAULT text-xs mt-2">ALERT: AI Model Provider uplink not established.</p>}
        </div>
      </section>

      {blueprintError && (
        <section className="mb-8 p-4 sm:p-6 bg-neonMagenta-DEFAULT/20 text-neonMagenta-light border-2 border-neonMagenta-dark rounded-md shadow-lg" role="alert">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">CRITICAL SYSTEM ERROR // BLUEPRINT FAILURE</h3>
          <p className="text-sm whitespace-pre-wrap">{blueprintError}</p>
        </section>
      )}
      
    </div>
  );
};
