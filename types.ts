

import { techCategories } from './constants';

export interface TechOption {
  id: string;
  name: string;
  category: string; // Should match one of the values in techCategories keys
}

export type TechCategoryKey = keyof typeof techCategories;
export type TechCategoryValue = typeof techCategories[TechCategoryKey];

export interface SelectedTechnologies {
  projectName: string;
  FRONTEND?: string;
  UI_LIBRARY?: string;
  BACKEND?: string;
  DATABASE?: string;
  AI_PROVIDER_NAME?: string; 
  DEPLOYMENT?: string;
}

export interface CategoryDefinition {
  key: TechCategoryKey;
  label: TechCategoryValue;
}

export type AiProviderId = 'gemini' | 'local_llm' | 'huggingface' | '';

export interface AiProviderConfig {
  id: AiProviderId;
  name: string;
}

export interface LocalLlmConfig {
  baseUrl: string;
  modelName: string;
}

export interface HuggingFaceConfig {
  modelId: string;
  apiKey?: string;
}

export interface AppEnvironmentVariables {
  API_KEY: string; 
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends AppEnvironmentVariables {}
  }
}

export interface User {
  id: string;
  username: string;
  email?: string;
  isAdmin?: boolean;
}

// --- Product and Shop Types ---
export type ProductType = 'physical' | 'digital' | 'service';
export type DigitalAssetOutputFormat = 'text' | 'markdown' | 'json_string';

export interface ServiceConfig {
  requiresTargetInfo: boolean;
}

export interface DigitalAssetConfig {
  generationPrompt: string;
  outputFormat: DigitalAssetOutputFormat;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock?: number; 
  category?: string; 
  productType: ProductType;
  serviceConfig?: ServiceConfig;
  digitalAssetConfig?: DigitalAssetConfig; // Added for digital products
}

export type ProductFormState = Omit<Product, 'id' | 'productType' | 'serviceConfig' | 'digitalAssetConfig'> & {
  id?: string;
  productType: ProductType;
  serviceRequiresTarget: boolean;
  generationPrompt?: string; // Added
  outputFormat?: DigitalAssetOutputFormat; // Added
};


export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  productType: ProductType;
  serviceConfig?: ServiceConfig;
  digitalAssetConfig?: DigitalAssetConfig; // Added for cart context
}

export interface AcquiredDigitalAsset {
  id: string; // Unique ID for this acquired instance
  userId: string;
  username: string;
  productId: string;
  productName: string;
  purchaseDate: Date; // Store as Date object, convert to/from ISO string for localStorage
  generatedContent: string | null;
  contentFormat: DigitalAssetOutputFormat;
  originalPrompt: string;
  generationStatus: 'pending' | 'completed' | 'failed';
  generationError?: string;
}

// --- Penetration Test Service Types ---
export interface PentestTargetInfo {
  targetUrl?: string;
  targetIp?: string;
  scopeNotes?: string;
}

export type PentestStatus = 
  | 'Awaiting Target Info'
  | 'Target Info Submitted'
  | 'Processing Request'
  | 'Information Gathering'
  | 'Vulnerability Scanning'
  | 'Analysis & Reporting'
  | 'Report Ready'
  | 'Admin Review'
  | 'Completed';

export interface PentestFinding {
  id: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational';
  title: string;
  description: string;
  cwe?: string; // Common Weakness Enumeration
  recommendation?: string;
  mockEvidence?: string; 
  mockMitigationSteps?: string[];
  simulatedExploitPath?: string[]; // Added this line
}

export interface AdaptiveDefenseLogEntry { // Added this interface
  action: string;
  detail: string;
  simulatedEffect: string;
  confidence: 'High' | 'Medium' | 'Low';
}

export interface SimulatedDefenseBypassAttempt { // Added this interface
  technique: string;
  targetDefenseAction: string;
  outcome: 'Defense Held' | 'Partially Bypassed' | 'Bypass Successful (Simulated)';
  detail: string;
}

export interface SecurityReport {
  reportId: string;
  targetSummary: PentestTargetInfo;
  executiveSummary: string;
  findings: PentestFinding[];
  overallRiskScore?: number; 
  generatedDate: Date; // Store as Date object
  methodology?: string;
  adaptiveDefenseSimulation?: AdaptiveDefenseLogEntry[]; 
  simulatedDefenseBypassAttempts?: SimulatedDefenseBypassAttempt[];
}

export interface CustomerFeedback {
  rating: number; 
  comment: string;
  timestamp: string; 
}

export interface PentestOrder {
  id: string; 
  userId: string;
  username: string;
  productId: string; 
  productName: string;
  orderDate: Date; // Store as Date object
  targetInfo: PentestTargetInfo | null;
  status: PentestStatus;
  report: SecurityReport | null;
  adminNotes?: string;
  lastAdminUpdateTimestamp?: string; 
  customerNotifiedOfLastAdminUpdate?: boolean; 
  lastNotificationTimestamp?: string; 
  customerFeedback?: CustomerFeedback; 
}


// --- App Navigation and Chat Types ---
export type ActiveView = 
  | 'landing' 
  | 'architect' 
  | 'chat' 
  | 'workspace' 
  | 'login' 
  | 'register' 
  | 'shop' 
  | 'cart' 
  | 'admin_products'
  | 'pentest_orders' 
  | 'security_report' 
  | 'admin_pentest_orders'
  | 'my_digital_assets'; // New view for acquired digital assets

export interface ChatMessageImageData {
  mimeType: string; 
  data: string;     
  fileName?: string; 
}

export interface GroundingSource {
  uri: string;
  title?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  imageData?: ChatMessageImageData | null;
  groundingSources?: GroundingSource[] | null;
  aiProviderName?: string; 
}

export type FileOperationAction = 'create' | 'update' | 'delete';

export interface FileOperation {
  action: FileOperationAction;
  fileName: string;
  content?: string;
  language?: string;
}

export interface AiChatStructuredResponse {
  type: 'fileOperation' | 'textResponse';
  message?: string;
  fileOps?: FileOperation[];
}

export interface BlueprintFile {
  name: string;
  language: string;
  content: string;
}

export interface ParsedBlueprint {
  overview: string;
  suggestedFiles: BlueprintFile[];
  nextSteps?: string[];
}

export type AiAgentMode = 
  | 'default' 
  | 'explain_code' 
  | 'generate_docs' 
  | 'refactor_code' 
  | 'generate_tests' 
  | 'command_oracle' 
  | 'research_oracle'
  | 'threat_intel_briefing'; // Added new mode

export interface AiAgentModeConfig {
  id: AiAgentMode;
  label: string;
  instruction: string;
  placeholder?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  children?: TreeNode[];
  fileData?: BlueprintFile;
}
