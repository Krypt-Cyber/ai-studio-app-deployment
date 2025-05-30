
import { GoogleGenAI, GenerateContentResponse, Chat, Part, SendMessageParameters, GenerateContentConfig } from "@google/genai";
import { SelectedTechnologies, ChatMessage, ParsedBlueprint, ChatMessageImageData, GroundingSource, AiAgentMode } from '../types';
import { GEMINI_MODEL_NAME } from '../constants';

// API_KEY is expected to be set in process.env
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
let chatInstance: Chat | null = null;

const initializeGeminiClient = (): GoogleGenAI => {
  if (!ai && apiKey) {
    ai = new GoogleGenAI({ apiKey });
  } else if (!apiKey) {
    console.warn("CRITICAL FAILURE: Google Gemini API key (API_KEY) environment variable is not set. Gemini API calls will fail.");
  }
  if (!ai) {
    throw new Error("Gemini API client could not be initialized. API_KEY may be missing or invalid. Ensure the 'API_KEY' environment variable is correctly configured in your execution environment.");
  }
  return ai;
}

// This is the system prompt for modes that expect structured JSON responses (fileOps, textResponse)
export const geminiChatSystemPromptForJson = `You are a versatile and helpful AI assistant.
You can receive text and, optionally, images. If an image is provided, consider its content in your response.
The user's message might be prefixed with "TASK_MODE: [Specific Task Instruction]" and/or "SELECTED_CODE:\n---\n[code snippet]\n---\nUSER_QUERY: [actual query]".
If these prefixes are present, focus on the specific task (e.g., explaining code, generating docs) using the provided code snippet and user query.
If the user asks you to create, update, or delete files for their project (based on text, image, or task mode input), your response MUST be a JSON object with the following structure:
{
  "type": "fileOperation",
  "message": "Okay, I've [created/updated/deleted] the file(s) as requested based on the task.",
  "fileOps": [
    {"action": "create", "fileName": "src/utils/newUtil.js", "language": "javascript", "content": "// New utility function content..."},
    {"action": "update", "fileName": "README.md", "content": "# Project Title\\nUpdated description..."},
    {"action": "delete", "fileName": "oldFile.txt"}
  ]
}
The 'fileName' should be a relative path from the project root (e.g., 'src/components/Button.tsx').
Ensure 'content' for 'create' or 'update' is a string. For JSON file content, ensure the string is properly escaped.
For all other requests (general conversation, questions, explanations not directly resulting in file changes, image descriptions, or when a task mode results in a textual answer), your response MUST be a JSON object with the following structure:
{
  "type": "textResponse",
  "message": "Your textual answer here. You can use Markdown for formatting."
}
Respond ONLY with one of these JSON objects. Do not include any other text outside the JSON structure.`;

// This is a simpler system prompt for the research_oracle mode, not strictly enforcing JSON output for the main message.
export const geminiChatSystemPromptForResearch = `You are a helpful research assistant.
The user's message might be prefixed with "TASK_MODE: [Specific Task Instruction]".
Use Google Search to answer questions that require recent, specific, or real-time information.
Summarize your findings clearly. If you use web sources, they will be cited automatically.
If an image is provided, consider its content in your response.`;


const initializeChat = () => {
  const currentAiInstance = initializeGeminiClient(); 
  if (!chatInstance) {
    console.log("Initializing new Gemini chat session...");
    chatInstance = currentAiInstance.chats.create({
      model: GEMINI_MODEL_NAME,
      config: { systemInstruction: geminiChatSystemPromptForJson },
    });
  }
  return chatInstance;
};


const formatTechnologyForPrompt = (label: string, value?: string): string => {
  return value ? `${label}: ${value}` : `${label}: Not specified`;
};

export const constructStackOverviewPromptForJson = (selections: SelectedTechnologies): string => {
  const {
    projectName,
    FRONTEND,
    UI_LIBRARY,
    BACKEND,
    DATABASE,
    DEPLOYMENT
  } = selections;

  return `
You are an expert software architect and helpful AI assistant.
A user is planning a new project and has selected the following technologies:

Project Name: ${projectName || "Unnamed Project"}
${formatTechnologyForPrompt("Frontend Framework", FRONTEND)}
${formatTechnologyForPrompt("UI Library", UI_LIBRARY)}
${formatTechnologyForPrompt("Backend Platform", BACKEND)}
${formatTechnologyForPrompt("Database", DATABASE)}
${formatTechnologyForPrompt("Deployment Platform", DEPLOYMENT)}
${selections.AI_PROVIDER_NAME ? `(The user is considering ${selections.AI_PROVIDER_NAME} for AI/ML tasks.)` : ''}

Please provide a comprehensive project blueprint. Your response MUST be a JSON object with the following structure:
{
  "overview": "A multi-paragraph summary of the chosen stack, its suitability, key synergies, considerations, initial setup best practices, tooling, learning curve, and scalability prospects. Format this overview using Markdown for readability (e.g., ## Heading, * item).",
  "suggestedFiles": [
    { "name": "package.json", "language": "json", "content": "{\\n  \\"name\\": \\"${projectName || 'new-project'}\\",\\n  \\"version\\": \\"1.0.0\\",\\n  /* basic dependencies based on stack */\\n}" },
    { "name": "src/index.js_or_main.py_or_equivalent", "language": "javascript_or_python_etc", "content": "// Basic entry point for ${BACKEND || FRONTEND || 'the project'}\\nconsole.log('Hello, world!');" },
    { "name": "public/index.html", "language": "html", "content": "<!DOCTYPE html>..." },
    { "name": "README.md", "language": "markdown", "content": "# ${projectName || 'New Project'}\\n\\nThis project uses ${FRONTEND}, ${BACKEND}, ${DATABASE}..." }
  ],
  "nextSteps": [
    "Example: Run 'npm install' to get dependencies.",
    "Set up your database connection string in a '.env' file.",
    "Initialize a git repository with 'git init' and make an initial commit.",
    "Consult the documentation for [specific technology] to explore advanced features."
  ]
}

Ensure the 'overview' is detailed and well-formatted Markdown.
Ensure 'suggestedFiles' includes a few key files with appropriate 'name', 'language', and example 'content'. JSON content within the 'content' field must be properly escaped.
For 'nextSteps', provide actionable advice. If a step involves a common CLI command (like 'npm install', 'git init', 'docker build -t myapp .', 'python -m venv .venv'), please include the command directly in the string, preferably enclosed in backticks (\`command here\`) for easy identification.
Respond ONLY with the JSON object. Do not include any other text or explanations outside the JSON structure.
  `;
};

export const generateStackOverviewWithGemini = async (selections: SelectedTechnologies): Promise<ParsedBlueprint> => {
  const currentAiInstance = initializeGeminiClient();
  const prompt = constructStackOverviewPromptForJson(selections);

  try {
    const response: GenerateContentResponse = await currentAiInstance.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json", 
      },
    });

    const jsonText = response.text;
    let cleanedJsonText = jsonText.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = cleanedJsonText.match(fenceRegex);
    if (match && match[2]) {
      cleanedJsonText = match[2].trim();
    }

    const parsedData = JSON.parse(cleanedJsonText);

    if (!parsedData.overview || !Array.isArray(parsedData.suggestedFiles)) {
      console.error("Parsed Gemini JSON data is missing required fields (overview, suggestedFiles):", parsedData);
      throw new Error("Gemini API returned an invalid JSON structure for the project blueprint.");
    }
    return parsedData as ParsedBlueprint;

  } catch (error) {
    console.error("Error calling Gemini API for stack overview (JSON):", error);
    if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse JSON response from Gemini API. Raw response may not be valid JSON. Check API logs if possible. Error: ${error.message}`);
    }
    if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("permission denied") || error.message.includes("API_KEY_INVALID") || error.message.includes("API_KEY")) {
             throw new Error("Invalid or improperly configured Gemini API Key. Please check your API_KEY environment variable or on Google AI Studio.");
        }
        if (error.message.includes("500") || error.message.toLowerCase().includes("xhr error") || error.message.toLowerCase().includes("network error") || error.message.toLowerCase().includes("rpc failed")) {
            throw new Error(`Gemini API request failed due to a network or server issue (e.g., 500/XHR/RPC). This might be temporary. Please check your internet connection, any browser extensions that might interfere, and try again later. Original error: ${error.message}`);
        }
        throw new Error(`Gemini API request failed (Stack Overview JSON): ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini API (Stack Overview JSON).");
  }
};

export const resetGeminiChat = () => {
    chatInstance = null; 
    console.log("Gemini chat instance reset. It will re-initialize with default settings on next message.");
};

export const sendMessageToGemini = async (
    messageContent: string, 
    _history: ChatMessage[], 
    agentMode: AiAgentMode,
    imageData?: ChatMessageImageData | null
): Promise<{ text: string; groundingSources?: GroundingSource[] }> => {
  initializeGeminiClient();
  const chat = initializeChat(); 

  try {
    const messageParts: Part[] = [{ text: messageContent }];
    if (imageData) {
      messageParts.push({
        inlineData: {
          mimeType: imageData.mimeType,
          data: imageData.data,
        },
      });
    }
    
    const sendMessageParams: SendMessageParameters = { message: messageParts };
    const messageSpecificConfig: GenerateContentConfig = {};

    if (agentMode === 'research_oracle') {
      messageSpecificConfig.tools = [{googleSearch: {}}];
      messageSpecificConfig.systemInstruction = geminiChatSystemPromptForResearch; // This overrides the chat's default for this call
    }
    // For other modes, no message-specific systemInstruction needs to be passed,
    // as the chat instance will use its default (geminiChatSystemPromptForJson).
    
    if (Object.keys(messageSpecificConfig).length > 0) {
        sendMessageParams.config = messageSpecificConfig;
    }
    
    const response: GenerateContentResponse = await chat.sendMessage(sendMessageParams);
    let groundingSources: GroundingSource[] | undefined = undefined;

    if (agentMode === 'research_oracle' && response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      const rawChunks = response.candidates[0].groundingMetadata.groundingChunks;
      groundingSources = rawChunks
        .filter((chunk: any) => chunk.web && chunk.web.uri) 
        .map((chunk: any) => ({
          uri: chunk.web.uri,
          title: chunk.web.title || chunk.web.uri, 
        }));
    }

    return { text: response.text, groundingSources };

  } catch (error) {
    console.error("Error sending message to Gemini Chat:", error);
     if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("permission denied") || error.message.includes("API_KEY_INVALID") || error.message.includes("API_KEY")) {
             resetGeminiChat(); 
             throw new Error("Invalid or improperly configured Gemini API Key. Chat session reset. Please check your API_KEY.");
        }
         if (error.message.includes("responseMimeType") && error.message.includes("googleSearch")) {
             throw new Error("Configuration error: responseMimeType: application/json cannot be used with Google Search. Dev error.");
         }
        if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
            throw new Error("Gemini API quota exceeded. Please check your usage limits or try again later.");
        }
        if (error.message.includes("500") || error.message.toLowerCase().includes("xhr error") || error.message.toLowerCase().includes("network error") || error.message.toLowerCase().includes("rpc failed")) {
            throw new Error(`Gemini Chat API request failed due to a network or server issue (e.g., 500/XHR/RPC). This might be temporary. Please check your internet connection, any browser extensions that might interfere, and try again later. Original error: ${error.message}`);
        }
        throw new Error(`Gemini Chat API request failed: ${error.message}`);
    }
    throw new Error("An unknown error occurred while communicating with the Gemini Chat API.");
  }
};

export const generateSimpleTextWithGemini = async (userPrompt: string): Promise<string> => {
  const currentAiInstance = initializeGeminiClient();
  if (!currentAiInstance) {
    throw new Error("Gemini API client is not initialized. Check API Key.");
  }
  try {
    const response = await currentAiInstance.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: userPrompt,
      // No specific config for simple text, unless we want to restrict output type
      // config: { responseMimeType: "text/plain" } // Optional: enforce plain text
    });
    return response.text;
  } catch (error) {
    console.error("Error in generateSimpleTextWithGemini:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid") || error.message.includes("permission denied") || error.message.includes("API_KEY_INVALID") || error.message.includes("API_KEY")) {
             throw new Error("Invalid or improperly configured Gemini API Key. Please check your API_KEY environment variable.");
        }
        if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
            throw new Error("Gemini API quota exceeded for simple text generation. Please check your usage limits or try again later.");
        }
        if (error.message.includes("500") || error.message.toLowerCase().includes("xhr error") || error.message.toLowerCase().includes("network error") || error.message.toLowerCase().includes("rpc failed")) {
            throw new Error(`Gemini API request for simple text generation failed due to a network or server issue. Original error: ${error.message}`);
        }
        throw new Error(`Gemini API request failed for simple text generation: ${error.message}`);
    }
    throw new Error("An unknown error occurred during simple text generation with Gemini API.");
  }
};
