
import { SelectedTechnologies, ChatMessage, ParsedBlueprint, BlueprintFile, AiChatStructuredResponse } from '../types';
// Use the JSON prompt constructor from geminiService as a base and adapt if necessary
// or create a dedicated one if significantly different instructions are needed for local LLMs.
import { constructStackOverviewPromptForJson as constructLocalLlmStackOverviewPromptJson } from './geminiService';


interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  format?: "json"; // For Ollama to return JSON directly
  stream?: boolean;
}

interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string; // This will be a JSON string if format: "json" is used and successful
  done: boolean;
  // other fields omitted for brevity
}

interface OllamaChatRequestMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
interface OllamaChatRequest {
  model: string;
  messages: OllamaChatRequestMessage[];
  format?: "json";
  stream?: boolean;
}
interface OllamaChatResponse {
    model: string;
    created_at: string;
    message: OllamaChatRequestMessage & { content: string }; // content will be JSON string
    done: boolean;
}


interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}
interface OpenAIChatCompletionRequest {
  model: string;
  messages: OpenAIMessage[];
  response_format?: { type: "json_object" }; // For OpenAI compatible to return JSON
  stream?: boolean;
}
interface OpenAIChatCompletionChoice {
  message: OpenAIMessage & { content: string }; // content will be JSON string
}
interface OpenAIChatCompletionResponse {
  choices: OpenAIChatCompletionChoice[];
}

// Helper to parse JSON from string, potentially cleaning markdown fences
const parseJsonFromString = (jsonString: string): any => {
  let cleanedJsonText = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanedJsonText.match(fenceRegex);
  if (match && match[2]) {
    cleanedJsonText = match[2].trim();
  }
  try {
    return JSON.parse(cleanedJsonText);
  } catch (e) {
    console.error("Failed to parse JSON string:", cleanedJsonText, e);
    throw new Error(`Failed to parse JSON response from LLM. Content: "${cleanedJsonText.substring(0,100)}..."`);
  }
}


export const generateStackOverviewWithLocalLlm = async (
  selections: SelectedTechnologies,
  baseUrl: string,
  modelName: string,
): Promise<ParsedBlueprint> => {
  if (!baseUrl || !modelName) {
    throw new Error("Local LLM base URL and model name are required.");
  }

  const promptContent = constructLocalLlmStackOverviewPromptJson(selections); // Re-use the detailed JSON prompt
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  
  const isLikelyOllama = normalizedBaseUrl.includes('localhost:11434') || normalizedBaseUrl.includes('ollama');
  const isOpenAICompatible = normalizedBaseUrl.includes("/v1");


  let apiEndpoint: string;
  let requestBody: object;
  let responseParser: (data: any) => ParsedBlueprint;

  if (isOpenAICompatible) {
    apiEndpoint = normalizedBaseUrl.endsWith("/v1") ? `${normalizedBaseUrl}/chat/completions` : normalizedBaseUrl;
    if (!apiEndpoint.includes('/chat/completions')) apiEndpoint += '/chat/completions';
    requestBody = {
        model: modelName,
        messages: [{ role: "user", content: promptContent }], 
        response_format: { type: "json_object" }, // Request JSON output
        stream: false,
    };
    responseParser = (data: OpenAIChatCompletionResponse) => {
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        const parsedJson = parseJsonFromString(data.choices[0].message.content);
        if (!parsedJson.overview || !Array.isArray(parsedJson.suggestedFiles)) {
            throw new Error("OpenAI-compatible LLM returned an invalid JSON structure for the project blueprint.");
        }
        return parsedJson as ParsedBlueprint;
      }
      throw new Error("Invalid OpenAI-compatible response format for stack overview JSON.");
    };
  } else if (isLikelyOllama) { 
    apiEndpoint = `${normalizedBaseUrl}/api/generate`; // Using /api/generate with format: "json"
    requestBody = {
      model: modelName,
      prompt: promptContent, // The prompt itself asks for JSON
      format: "json",       // Instruct Ollama to output JSON
      stream: false,
    };
    responseParser = (data: OllamaGenerateResponse) => { // Ollama response field holds the JSON string
      if (data.response) {
        const parsedJson = parseJsonFromString(data.response);
         if (!parsedJson.overview || !Array.isArray(parsedJson.suggestedFiles)) {
            throw new Error("Ollama returned an invalid JSON structure for the project blueprint.");
        }
        return parsedJson as ParsedBlueprint;
      }
      throw new Error("Invalid Ollama /api/generate (JSON format) response for stack overview.");
    };
  } else { 
      apiEndpoint = `${normalizedBaseUrl}/api/generate`; 
      console.warn(`Base URL ${normalizedBaseUrl} doesn't match known OpenAI or Ollama patterns. Attempting generic /api/generate for stack overview, expecting JSON in response text.`);
      requestBody = { model: modelName, prompt: promptContent, stream: false }; // Prompt asks for JSON
      responseParser = (data: any) => { 
          let textResponse = "";
          if (data.response) textResponse = data.response;
          else if (data.text) textResponse = data.text;
          else if (data.generated_text) textResponse = data.generated_text;
          else {
            throw new Error("Could not extract text from generic local LLM response for stack overview JSON.");
          }
          const parsedJson = parseJsonFromString(textResponse);
          if (!parsedJson.overview || !Array.isArray(parsedJson.suggestedFiles)) {
            throw new Error("Generic LLM returned an invalid JSON structure for the project blueprint.");
          }
          return parsedJson as ParsedBlueprint;
      };
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Local LLM API request (Stack Overview JSON) failed with status ${response.status}: ${errorBody}`);
    }
    const data = await response.json();
    return responseParser(data);

  } catch (error) {
    console.error("Error calling Local LLM API (Stack Overview JSON):", error);
    let detailedMessage = "An unknown error occurred while communicating with the Local LLM (Stack Overview JSON).";
     if (error instanceof TypeError && (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror'))) {
        detailedMessage = `Network error (Stack Overview JSON) attempting to reach Local LLM at ${baseUrl}. Check CORS, server, model '${modelName}', and firewall.`;
    } else if (error instanceof Error) {
        detailedMessage = `Local LLM communication error (Stack Overview JSON): ${error.message}. Ensure server at ${baseUrl}, model '${modelName}' is available, and check CORS.`;
    }
    throw new Error(detailedMessage);
  }
};


// CHAT Functions
export const localLlmChatSystemPrompt = `You are a versatile and helpful AI assistant.
The user's message might be prefixed with "TASK_MODE: [Specific Task Instruction]" and/or "SELECTED_CODE:\n---\n[code snippet]\n---\nUSER_QUERY: [actual query]".
If these prefixes are present, focus on the specific task (e.g., explaining code, generating docs) using the provided code snippet and user query.
You can help generate code (using Markdown for code blocks), website structures, program logic, answer questions, draft text, and much more.
If the user asks you to create, update, or delete files for their project, your response MUST be a JSON object with the following structure:
{
  "type": "fileOperation",
  "message": "Okay, I've [created/updated/deleted] the file(s) as requested.",
  "fileOps": [
    {"action": "create", "fileName": "src/utils/newUtil.js", "language": "javascript", "content": "// New utility function content..."},
    {"action": "update", "fileName": "README.md", "content": "# Project Title\\nUpdated description..."},
    {"action": "delete", "fileName": "oldFile.txt"}
  ]
}
The 'fileName' should be a relative path from the project root (e.g., 'src/components/Button.tsx').
Ensure 'content' for 'create' or 'update' is a string. For JSON file content, ensure the string is properly escaped.
For all other requests (general conversation, questions, explanations not directly resulting in file changes, or when a task mode results in a textual answer), your response MUST be a JSON object with the following structure:
{
  "type": "textResponse",
  "message": "Your textual answer here. You can use Markdown for formatting."
}
Respond ONLY with one of these JSON objects. Do not include any other text outside the JSON structure.`;


const convertToOllamaMessages = (chatHistory: ChatMessage[], newUserInput: string, systemPrompt: string): OllamaChatRequestMessage[] => {
    const messages: OllamaChatRequestMessage[] = [{ role: 'system', content: systemPrompt }];
    chatHistory.forEach(msg => {
        if (msg.sender === 'user' || msg.sender === 'ai') { 
             // For AI messages that might have been fileOps, we take their textual 'content' part
            messages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content });
        }
    });
    messages.push({ role: 'user', content: newUserInput }); // newUserInput already contains TASK_MODE etc.
    return messages;
};

const convertToOpenAIMessages = (chatHistory: ChatMessage[], newUserInput: string, systemPrompt: string): OpenAIMessage[] => {
    const messages: OpenAIMessage[] = [{ role: 'system', content: systemPrompt }];
    chatHistory.forEach(msg => {
         if (msg.sender === 'user' || msg.sender === 'ai') {
            messages.push({ role: msg.sender === 'user' ? 'user' : 'assistant', content: msg.content });
        }
    });
    messages.push({ role: 'user', content: newUserInput }); // newUserInput already contains TASK_MODE etc.
    return messages;
};

const constructPromptWithHistory = (chatHistory: ChatMessage[], newUserInput: string, systemPrompt: string): string => {
  let fullPrompt = systemPrompt ? `${systemPrompt}\n\n` : "";
  chatHistory.forEach(msg => {
    if (msg.sender === 'user' || msg.sender === 'ai') {
        fullPrompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    }
  });
  // newUserInput already contains potential TASK_MODE prefixes
  fullPrompt += `User: ${newUserInput}\nAssistant:`; // AI should output the JSON structure here
  return fullPrompt;
};


export const sendMessageToLocalLlm = async (
  currentUserInput: string, // This now includes potential prefixes like TASK_MODE and SELECTED_CODE
  chatHistory: ChatMessage[], 
  baseUrl: string,
  modelName: string,
): Promise<string> => { // Returns raw string (expected to be JSON)
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  const isLikelyOllama = normalizedBaseUrl.includes('localhost:11434') || normalizedBaseUrl.includes('ollama');
  const isOpenAICompatible = normalizedBaseUrl.includes("/v1");

  let apiEndpoint: string;
  let requestBody: object;
  let responseExtractor: (data: any) => string; // Extracts the raw string response

  // Pass the updated localLlmChatSystemPrompt to history/prompt construction helpers
  if (isOpenAICompatible) {
    apiEndpoint = normalizedBaseUrl.endsWith("/v1") ? `${normalizedBaseUrl}/chat/completions` : normalizedBaseUrl;
     if (!apiEndpoint.includes('/chat/completions')) apiEndpoint += '/chat/completions';
    requestBody = {
        model: modelName,
        messages: convertToOpenAIMessages(chatHistory, currentUserInput, localLlmChatSystemPrompt),
        response_format: { type: "json_object" }, // Request direct JSON
        stream: false,
    };
    responseExtractor = (data: OpenAIChatCompletionResponse) => {
      if (data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content; // This should be the JSON string
      }
      throw new Error("Invalid OpenAI-compatible response format for chat (expected JSON string).");
    };
  } else if (isLikelyOllama) { 
    apiEndpoint = `${normalizedBaseUrl}/api/chat`;
    requestBody = {
        model: modelName,
        messages: convertToOllamaMessages(chatHistory, currentUserInput, localLlmChatSystemPrompt),
        format: "json", // Request direct JSON
        stream: false,
    };
    responseExtractor = (data: OllamaChatResponse) => {
      if (data.message && data.message.content) {
        return data.message.content; // This should be the JSON string
      }
      throw new Error("Invalid Ollama /api/chat response format (expected JSON string).");
    };
  } else { 
    console.warn(`Local LLM URL ${normalizedBaseUrl} doesn't match OpenAI or Ollama /api/chat patterns. Falling back to /api/generate for chat, expecting JSON string in response.`);
    apiEndpoint = `${normalizedBaseUrl}/api/generate`;
    requestBody = {
        model: modelName,
        prompt: constructPromptWithHistory(chatHistory, currentUserInput, localLlmChatSystemPrompt),
        system: localLlmChatSystemPrompt, 
        format: "json", 
        stream: false,
    };
     responseExtractor = (data: OllamaGenerateResponse) => { 
      if (data.response) return data.response; 
      throw new Error("Invalid Ollama /api/generate response format for chat fallback (expected JSON string).");
    };
  }

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      if (isLikelyOllama && apiEndpoint.endsWith('/api/chat') && (response.status === 404 || response.status === 500)) {
          console.warn("Ollama /api/chat failed, attempting /api/generate as fallback...");
          return sendMessageToLocalLlmWithGenerateFallback(currentUserInput, chatHistory, baseUrl, modelName, localLlmChatSystemPrompt);
      }
      throw new Error(`Local LLM API request (Chat) failed with status ${response.status}: ${errorBody}`);
    }
    const data = await response.json();
    return responseExtractor(data);

  } catch (error) {
    console.error("Error calling Local LLM API (Chat):", error);
    let detailedMessage = "An unknown error occurred while communicating with the Local LLM (Chat).";
    if (error instanceof TypeError && (error.message.toLowerCase().includes('failed to fetch') || error.message.toLowerCase().includes('networkerror'))) {
        detailedMessage = `Network error (Chat) attempting to reach Local LLM at ${baseUrl}. Check CORS, server status, model '${modelName}', and firewall.`;
    } else if (error instanceof Error) {
        detailedMessage = `Local LLM communication error (Chat): ${error.message}. Ensure server at ${baseUrl} is running, model '${modelName}' is available, and check CORS.`;
    }
    throw new Error(detailedMessage);
  }
};

// Fallback specifically for Ollama if /api/chat is not available or fails
const sendMessageToLocalLlmWithGenerateFallback = async (
    currentUserInput: string,
    chatHistory: ChatMessage[],
    baseUrl: string,
    modelName: string,
    systemPromptToUse: string, // Explicitly pass system prompt
): Promise<string> => { // Returns raw string
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
    const apiEndpoint = `${normalizedBaseUrl}/api/generate`;
    const requestBody = {
        model: modelName,
        prompt: constructPromptWithHistory(chatHistory, currentUserInput, systemPromptToUse),
        system: systemPromptToUse, 
        format: "json", 
        stream: false,
    };
    const responseExtractor = (data: OllamaGenerateResponse) => {
        if (data.response) return data.response; 
        throw new Error("Invalid Ollama /api/generate response format during chat fallback (expected JSON string).");
    };

    console.log("Using Ollama /api/generate fallback for chat, expecting JSON string in response.");
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Local LLM API request (Chat /api/generate fallback) failed with status ${response.status}: ${errorBody}`);
    }
    const data = await response.json();
    return responseExtractor(data);
};