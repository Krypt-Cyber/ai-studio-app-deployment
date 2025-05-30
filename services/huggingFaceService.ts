
import { SelectedTechnologies, ChatMessage, ParsedBlueprint, AiChatStructuredResponse } from '../types';
// Use the JSON prompt constructor from geminiService as a base.
import { constructStackOverviewPromptForJson as constructHfStackOverviewPromptJson } from './geminiService';

interface HuggingFaceTextGenerationRequest {
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    temperature?: number;
    return_full_text?: boolean; 
  };
  options?: {
    wait_for_model?: boolean;
  }
}

interface HuggingFaceTextGenerationResponseItem {
  generated_text: string;
}

type HuggingFaceTextGenerationResponse = HuggingFaceTextGenerationResponseItem[];


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
    console.error("Failed to parse JSON string from Hugging Face:", cleanedJsonText, e);
    throw new Error(`Failed to parse JSON response from Hugging Face. Content: "${cleanedJsonText.substring(0,100)}..."`);
  }
}


export const generateStackOverviewWithHuggingFace = async (
  selections: SelectedTechnologies,
  modelId: string,
  apiKey?: string,
): Promise<ParsedBlueprint> => {
  if (!modelId) {
    throw new Error("Hugging Face Model ID is required.");
  }

  const promptContent = constructHfStackOverviewPromptJson(selections); // Prompt asks for JSON output
  const apiEndpoint = `https://api-inference.huggingface.co/models/${modelId}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const requestBody: HuggingFaceTextGenerationRequest = {
    inputs: promptContent,
    parameters: {
        max_new_tokens: 3072, // Increased for potentially large JSON, was 2048
        temperature: 0.3, // Lower temperature for more deterministic JSON output, was 0.5
        return_full_text: false, 
    },
    options: {
        wait_for_model: true 
    }
  };

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `Hugging Face API request (Stack Overview JSON) failed with status ${response.status}: ${errorBody}`;
      if (response.status === 401) {
        errorMessage = "Hugging Face API request failed (Stack Overview JSON): Unauthorized. Check API key or model permissions.";
      } else if (response.status === 404) {
        errorMessage = `Hugging Face API request failed (Stack Overview JSON): Model not found ('${modelId}').`;
      } else if (response.status === 503 && errorBody.includes("is currently loading")) {
        errorMessage = `Hugging Face model '${modelId}' (Stack Overview JSON) is loading. Try again.`;
      }
      throw new Error(errorMessage);
    }

    const data: HuggingFaceTextGenerationResponse | { error?: string, estimated_time?: number } = await response.json();

    if ('error' in data && typeof data.error === 'string') {
        if (data.estimated_time) {
            throw new Error(`Hugging Face model '${modelId}' (Stack Overview JSON) is loading. Estimated time: ${data.estimated_time.toFixed(1)}s. Try again.`);
        }
        throw new Error(`Hugging Face API error for model '${modelId}' (Stack Overview JSON): ${data.error}`);
    }

    const hfResponse = data as HuggingFaceTextGenerationResponse;
    if (hfResponse && hfResponse.length > 0 && hfResponse[0].generated_text) {
      const parsedJson = parseJsonFromString(hfResponse[0].generated_text);
      if (!parsedJson.overview || !Array.isArray(parsedJson.suggestedFiles)) {
            throw new Error("Hugging Face LLM returned an invalid JSON structure for the project blueprint.");
      }
      return parsedJson as ParsedBlueprint;
    }
    
    console.warn("Hugging Face response format not recognized (Stack Overview JSON). Raw response:", data);
    throw new Error("Could not parse a valid response from Hugging Face (Stack Overview JSON).");

  } catch (error) {
    console.error("Error calling Hugging Face API (Stack Overview JSON):", error);
    if (error instanceof Error) {
      throw new Error(`Hugging Face communication error (Stack Overview JSON): ${error.message}`);
    }
    throw new Error("An unknown error occurred with Hugging Face API (Stack Overview JSON).");
  }
};

// CHAT Functions
export const huggingFaceChatSystemPrompt = `You are a versatile and helpful AI assistant.
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
Respond ONLY with one of these JSON objects. Do not include any other text outside the JSON structure. The JSON object should be the only thing in your response.`;


const constructChatPromptForHuggingFace = (
    chatHistory: ChatMessage[], 
    newUserInput: string, // This now includes potential prefixes like TASK_MODE and SELECTED_CODE
    systemPrompt: string
): string => {
  let fullPrompt = systemPrompt ? `${systemPrompt}\n\nConversation History (user messages and only the 'message' part of your JSON responses):\n` : "Conversation History:\n";
  chatHistory.forEach(msg => {
    if (msg.sender === 'user' || msg.sender === 'ai') { 
        fullPrompt += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    }
  });
  // newUserInput already contains TASK_MODE etc.
  fullPrompt += `User: ${newUserInput}\nAssistant:`; // AI should output the JSON structure here
  return fullPrompt;
};

export const sendMessageToHuggingFace = async (
  currentUserInput: string, // This now includes potential prefixes like TASK_MODE and SELECTED_CODE
  chatHistory: ChatMessage[], 
  modelId: string,
  apiKey?: string,
): Promise<string> => { // Returns raw string (expected to be JSON)
  // Pass the updated huggingFaceChatSystemPrompt
  const prompt = constructChatPromptForHuggingFace(chatHistory, currentUserInput, huggingFaceChatSystemPrompt);
  const apiEndpoint = `https://api-inference.huggingface.co/models/${modelId}`;

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  const requestBody: HuggingFaceTextGenerationRequest = {
    inputs: prompt,
    parameters: {
        max_new_tokens: 2048, 
        temperature: 0.5, 
        return_full_text: false, 
    },
    options: { wait_for_model: true }
  };

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = `Hugging Face API request (Chat) failed with status ${response.status}: ${errorBody}`;
       if (response.status === 401) {
        errorMessage = "Hugging Face API request failed (Chat): Unauthorized. Check your API key or model permissions.";
      } else if (response.status === 404) {
        errorMessage = `Hugging Face API request failed (Chat): Model '${modelId}' not found.`;
      } else if (response.status === 503 && errorBody.includes("is currently loading")) {
        errorMessage = `Hugging Face model '${modelId}' (Chat) is loading. Try again.`;
      }
      throw new Error(errorMessage);
    }

    const data: HuggingFaceTextGenerationResponse | { error?: string, estimated_time?: number } = await response.json();

    if ('error' in data && typeof data.error === 'string') {
        if (data.estimated_time) {
            throw new Error(`Hugging Face model '${modelId}' (Chat) is loading. Estimated time: ${data.estimated_time.toFixed(1)}s. Try again.`);
        }
        throw new Error(`Hugging Face API error for model '${modelId}' (Chat): ${data.error}`);
    }

    const hfResponse = data as HuggingFaceTextGenerationResponse;
    if (hfResponse && hfResponse.length > 0 && typeof hfResponse[0].generated_text === 'string') {
      return hfResponse[0].generated_text.trim(); // This is expected to be the JSON string
    }
    
    console.warn("Hugging Face response format not recognized (Chat). Raw response:", data);
    throw new Error("Could not parse valid response from Hugging Face (Chat). Expected JSON string.");

  } catch (error) {
    console.error("Error calling Hugging Face API (Chat):", error);
    if (error instanceof Error) {
      throw new Error(`Hugging Face communication error (Chat): ${error.message}`);
    }
    throw new Error("An unknown error occurred with Hugging Face API (Chat).");
  }
};