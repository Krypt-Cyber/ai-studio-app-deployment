
import React from 'react';
import { AiProviderId, LocalLlmConfig, HuggingFaceConfig } from '../types';
import { SelectInput, SelectOption } from './ui/SelectInput';
import { TextInput } from './ui/TextInput';
import { AI_PROVIDER_OPTIONS } from '../constants';

interface AiProviderConfiguratorProps {
  selectedAiProvider: AiProviderId;
  setSelectedAiProvider: (id: AiProviderId) => void;
  localLlmConfig: LocalLlmConfig;
  setLocalLlmConfig: (config: LocalLlmConfig | ((prevState: LocalLlmConfig) => LocalLlmConfig)) => void;
  huggingFaceConfig: HuggingFaceConfig;
  setHuggingFaceConfig: (config: HuggingFaceConfig | ((prevState: HuggingFaceConfig) => HuggingFaceConfig)) => void;
  idPrefix?: string; 
}

export const AiProviderConfigurator: React.FC<AiProviderConfiguratorProps> = ({
  selectedAiProvider,
  setSelectedAiProvider,
  localLlmConfig,
  setLocalLlmConfig,
  huggingFaceConfig,
  setHuggingFaceConfig,
  idPrefix = 'ai-provider-config',
}) => {
  const aiProviderOptions: SelectOption[] = AI_PROVIDER_OPTIONS.map(p => ({ value: p.id, label: p.name }));

  return (
    <div className="space-y-2">
      <SelectInput
        id={`${idPrefix}-selector`}
        label="AI UPLINK PROTOCOL:" 
        options={aiProviderOptions}
        value={selectedAiProvider}
        onChange={(id) => setSelectedAiProvider(id as AiProviderId)}
      />
      {selectedAiProvider === 'local_llm' && (
        <div className="p-2 border border-neutral-medium rounded-sm bg-neutral-darkest/50 space-y-1.5">
          <p className="text-xs text-neonCyan-light mb-1">// Configure Local LLM Node (e.g., Ollama)</p>
          <TextInput
            label="Node API Base URL"
            id={`${idPrefix}-local-baseurl`}
            value={localLlmConfig.baseUrl}
            onChange={(value) => setLocalLlmConfig(prev => ({ ...prev, baseUrl: value }))}
            placeholder="e.g., http://localhost:11434"
          />
          <TextInput
            label="Model Identifier"
            id={`${idPrefix}-local-modelname`}
            value={localLlmConfig.modelName}
            onChange={(value) => setLocalLlmConfig(prev => ({ ...prev, modelName: value }))}
            placeholder="e.g., llama3:latest, phi3:medium"
          />
          <p className="text-xs text-neutral-medium mt-1">
            Node must support JSON data stream (e.g., Ollama's <code className="text-xs bg-neutral-dark px-1 py-0.5 rounded-sm text-neonGreen-light">format: "json"</code>) or prompt must enforce JSON protocol.
          </p>
        </div>
      )}
      {selectedAiProvider === 'huggingface' && (
        <div className="p-2 border border-neutral-medium rounded-sm bg-neutral-darkest/50 space-y-1.5">
          <p className="text-xs text-neonCyan-light mb-1">// Configure Hugging Face Inference Endpoint</p>
          <TextInput
            label="Hugging Face Model ID"
            id={`${idPrefix}-hf-modelid`}
            value={huggingFaceConfig.modelId}
            onChange={(value) => setHuggingFaceConfig(prev => ({ ...prev, modelId: value }))}
            placeholder="e.g., mistralai/Mistral-7B-Instruct-v0.1"
          />
          <TextInput
            label="Hugging Face Access Token (Optional)"
            id={`${idPrefix}-hf-apikey`}
            type="password"
            value={huggingFaceConfig.apiKey || ''}
            onChange={(value) => setHuggingFaceConfig(prev => ({ ...prev, apiKey: value }))}
            placeholder="Recommended for enhanced uplink bandwidth"
          />
        </div>
      )}
      {selectedAiProvider === 'gemini' && (
        <div className="p-2 border border-neutral-medium rounded-sm bg-neutral-darkest/50">
          <p className="text-sm text-neonCyan-light">
            Google Gemini API Uplink Active. Ensure <code className="bg-neutral-dark px-1 py-0.5 rounded-sm text-xs text-neonGreen-light">API_KEY</code> secure environment variable is configured.
          </p>
        </div>
      )}
    </div>
  );
};