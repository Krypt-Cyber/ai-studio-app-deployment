
import { TechOption, TechCategoryKey, CategoryDefinition, AiProviderConfig, AiAgentModeConfig, Product, ProductType, PentestStatus, DigitalAssetOutputFormat } from './types';

// Renamed AI_ML to AI_PROVIDER
export const techCategories = {
  FRONTEND: "Frontend Framework",
  UI_LIBRARY: "UI Library",
  BACKEND: "Backend Platform",
  DATABASE: "Database",
  AI_PROVIDER: "AI Model Provider", // Renamed from AI_ML
  DEPLOYMENT: "Deployment Platform",
} as const;

export const CATEGORY_ORDER: CategoryDefinition[] = [
  { key: "FRONTEND", label: techCategories.FRONTEND },
  { key: "UI_LIBRARY", label: techCategories.UI_LIBRARY },
  { key: "BACKEND", label: techCategories.BACKEND },
  { key: "DATABASE", label: techCategories.DATABASE },
  { key: "AI_PROVIDER", label: techCategories.AI_PROVIDER }, // Updated key
  { key: "DEPLOYMENT", label: techCategories.DEPLOYMENT },
];

export const AI_PROVIDER_OPTIONS: AiProviderConfig[] = [
  { id: "gemini", name: "Google Gemini API" },
  { id: "local_llm", name: "Local LLM (User-Defined)" },
  { id: "huggingface", name: "Hugging Face Hub (Text Gen.)" },
];

export const TECHNOLOGY_OPTIONS: Record<Exclude<TechCategoryKey, 'AI_PROVIDER'>, TechOption[]> & { AI_PROVIDER: TechOption[] } = {
  FRONTEND: [
    { id: "react", name: "React", category: techCategories.FRONTEND },
    { id: "vue", name: "Vue.js", category: techCategories.FRONTEND },
    { id: "angular", name: "Angular", category: techCategories.FRONTEND },
    { id: "svelte", name: "Svelte", category: techCategories.FRONTEND },
    { id: "nextjs", name: "Next.js (React)", category: techCategories.FRONTEND },
    { id: "nuxtjs", name: "Nuxt.js (Vue)", category: techCategories.FRONTEND },
    { id: "solidjs", name: "SolidJS", category: techCategories.FRONTEND },
  ],
  UI_LIBRARY: [
    { id: "tailwind", name: "Tailwind CSS", category: techCategories.UI_LIBRARY },
    { id: "mui", name: "Material UI", category: techCategories.UI_LIBRARY },
    { id: "bootstrap", name: "Bootstrap", category: techCategories.UI_LIBRARY },
    { id: "shadcnui", name: "Shadcn/ui", category: techCategories.UI_LIBRARY },
    { id: "chakraui", name: "Chakra UI", category: techCategories.UI_LIBRARY },
    { id: "radixui", name: "Radix UI (Primitives)", category: techCategories.UI_LIBRARY },
  ],
  BACKEND: [
    { id: "nodejs_express", name: "Node.js (Express)", category: techCategories.BACKEND },
    { id: "python_django", name: "Python (Django)", category: techCategories.BACKEND },
    { id: "nodejs_nest", name: "Node.js (NestJS)", category: techCategories.BACKEND },
    { id: "python_flask", name: "Python (Flask)", category: techCategories.BACKEND },
    { id: "java_spring", name: "Java (Spring Boot)", category: techCategories.BACKEND },
    { id: "golang_gin", name: "Go (Gin)", category: techCategories.BACKEND },
    { id: "ruby_rails", name: "Ruby on Rails", category: techCategories.BACKEND },
    { id: "rust_axum", name: "Rust (Axum)", category: techCategories.BACKEND },
    { id: "dotnet_aspnet", name: ".NET (ASP.NET Core)", category: techCategories.BACKEND },
  ],
  DATABASE: [
    { id: "postgres", name: "PostgreSQL", category: techCategories.DATABASE },
    { id: "mongodb", name: "MongoDB", category: techCategories.DATABASE },
    { id: "mysql", name: "MySQL", category: techCategories.DATABASE },
    { id: "firebase_firestore", name: "Firebase Firestore", category: techCategories.DATABASE },
    { id: "supabase_db", name: "Supabase (Postgres)", category: techCategories.DATABASE },
    { id: "sqlite", name: "SQLite", category: techCategories.DATABASE },
    { id: "redis", name: "Redis", category: techCategories.DATABASE },
  ],
  AI_PROVIDER: AI_PROVIDER_OPTIONS.map(p => ({ ...p, category: techCategories.AI_PROVIDER } as TechOption)),
  DEPLOYMENT: [
    { id: "vercel", name: "Vercel", category: techCategories.DEPLOYMENT },
    { id: "netlify", name: "Netlify", category: techCategories.DEPLOYMENT },
    { id: "aws_amplify", name: "AWS Amplify", category: techCategories.DEPLOYMENT },
    { id: "gcp_run", name: "Google Cloud Run", category: techCategories.DEPLOYMENT },
    { id: "azure_apps", name: "Azure App Service", category: techCategories.DEPLOYMENT },
    { id: "docker_k8s", name: "Docker + Kubernetes", category: techCategories.DEPLOYMENT },
    { id: "flyio", name: "Fly.io", category: techCategories.DEPLOYMENT },
  ],
};

export const GEMINI_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';
export const HUGGING_FACE_DEFAULT_TEXT_MODEL = 'mistralai/Mistral-7B-Instruct-v0.1';
export const LOCAL_LLM_DEFAULT_MODEL_NAME = 'llama3:latest';
export const LOCAL_LLM_DEFAULT_BASE_URL = 'http://localhost:11434';

export const AI_AGENT_MODES: AiAgentModeConfig[] = [
  { id: 'default', label: 'Standard Protocol', instruction: 'Standard Protocol: Respond to the user query directly.', placeholder: "Transmit query to AI Agent..." },
  { id: 'explain_code', label: 'Code Deconstructor', instruction: 'Code Deconstructor: Explain the provided code.', placeholder: "Describe selection or ask about the code..." },
  { id: 'generate_docs', label: 'Doc Synthesizer', instruction: 'Doc Synthesizer: Generate documentation for the provided code.', placeholder: "Specify documentation type (e.g., JSDoc)..." },
  { id: 'refactor_code', label: 'Code Optimizer', instruction: 'Code Optimizer: Suggest refactorings for the provided code.', placeholder: "Specify refactoring goals (e.g., improve readability)..." },
  { id: 'generate_tests', label: 'Test Matrix Gen.', instruction: 'Test Matrix Gen.: Generate unit tests for the provided code.', placeholder: "Specify testing framework if any..." },
  {
    id: 'command_oracle',
    label: 'Command Oracle',
    instruction: 'Command Oracle: Provide relevant CLI commands for the given task or project context. Explain what each command does briefly. If multiple commands are needed, list them. Format commands clearly, ideally using backticks or Markdown code blocks for the command itself.',
    placeholder: "Query for CLI commands (e.g., 'git commit changes', 'start dev server for [framework]')..."
  },
  {
    id: 'research_oracle',
    label: 'Research Oracle',
    instruction: 'Research Oracle: Provide up-to-date information using Google Search for relevant queries. Summarize findings and list web sources if used.',
    placeholder: "Query the Oracle for latest intel, e.g., 'latest advancements in quantum computing'..."
  },
  {
    id: 'threat_intel_briefing',
    label: 'Threat Intel Briefing (Executive)',
    instruction: "TASK_MODE: Threat Intel Briefing (Executive): Based on provided security report findings (especially focusing on 'Project Chimera' details like simulated exploit paths and defense bypass attempts, if available), generate a concise, non-technical executive threat briefing. Highlight key risks, the robustness of simulated defenses, and strategic recommendations. Structure for clarity for a leadership audience. Use professional, direct language. If no specific report data is pasted, ask the user to provide key points from their 'Project Chimera' report.",
    placeholder: "Paste key 'Project Chimera' findings or ask for a general briefing structure..."
  },
];

export const PRODUCT_TYPES: { value: ProductType; label: string }[] = [
  { value: 'physical', label: 'Physical Asset' },
  { value: 'digital', label: 'Digital Asset / Intel' },
  { value: 'service', label: 'Cyber Security Service' },
];

export const DIGITAL_PRODUCT_OUTPUT_FORMATS: { value: DigitalAssetOutputFormat; label: string }[] = [
  { value: 'markdown', label: 'Markdown (Formatted Text)' },
  { value: 'text', label: 'Plain Text' },
  { value: 'json_string', label: 'JSON String (Escaped)' },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod_001',
    name: 'Cryptex USB Drive - 128GB',
    description: 'A mechanically-locked USB drive. Only those with the correct code can access its secrets. Fort Knox for your data.',
    price: 79.99,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Cryptex+USB',
    stock: 50,
    category: 'Secure Hardware',
    productType: 'physical',
  },
  {
    id: 'prod_002',
    name: 'Zero-Day Exploit Brief (Digital)',
    description: 'Unlock any system. Hypothetically, of course. This is a digital artwork representing a zero-day. For educational purposes only.',
    price: 999.99,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=0-Day+Art',
    stock: 10,
    category: 'Digital Intel',
    productType: 'digital',
    digitalAssetConfig: {
        generationPrompt: "Generate a fictional, high-level conceptual overview of a zero-day exploit targeting a common (fictional) IoT device. Detail potential abstract attack vectors and impacts. Keep it conceptual and for educational/storytelling purposes. Output as markdown.",
        outputFormat: 'markdown',
    }
  },
  {
    id: 'prod_003_emp', // Changed ID to avoid conflict with prod_svc_003
    name: 'Portable EMP Device (Conceptual Design)',
    description: 'A schematic and component list for a conceptual, pocket-sized EMP. Disables electronics in a small radius. Strictly theoretical.',
    price: 49.50,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=EMP+Schematic',
    stock: 100,
    category: 'Conceptual Blueprints',
    productType: 'digital',
    digitalAssetConfig: {
        generationPrompt: "Generate a fictional, conceptual design brief for a pocket-sized EMP device. Focus on theoretical components (e.g., 'miniaturized pulse capacitor', 'bio-frequency scrambler'), its operating principles, and potential (fictional) effects on common electronics. Do not include actual build instructions. Output as a short markdown document.",
        outputFormat: 'markdown',
    }
  },
  {
    id: 'prod_svc_001',
    name: 'Basis KI-Reconnaissance-Scan',
    description: 'Automated KI-driven reconnaissance for a single target URL/IP. Identifies open ports, services, and basic footprinting. Report generated.',
    price: 250.00,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=KI+Recon+Scan',
    stock: Infinity,
    category: 'Cyber Security Services',
    productType: 'service',
    serviceConfig: { requiresTargetInfo: true },
  },
  {
    id: 'prod_svc_002',
    name: 'Fortgeschrittene KI-Schwachstellenanalyse',
    description: 'Comprehensive KI-powered vulnerability scan and analysis for a web application. Includes simulated attack vectors and detailed reporting. Techniques continuously refined.',
    price: 750.00,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=KI+Vuln+Scan',
    stock: Infinity,
    category: 'Cyber Security Services',
    productType: 'service',
    serviceConfig: { requiresTargetInfo: true },
  },
  {
    id: 'prod_svc_003',
    name: 'Project Chimera: KI Threat Simulation & Adaptive Defense Protocol',
    description: 'ULTRA-PREMIUM: KI-driven deep threat simulation, attack vector mapping, and adaptive defense protocol evaluation for critical infrastructure targets. Includes advanced persistent threat (APT) emulation scenarios.',
    price: 2500.00, // Premium pricing
    imageUrl: 'https://via.placeholder.com/300x200.png?text=Project+Chimera',
    stock: Infinity,
    category: 'Cyber Security Services',
    productType: 'service',
    serviceConfig: { requiresTargetInfo: true }, // Assuming it requires target info
  },
  {
    id: 'prod_005',
    name: 'Encrypted Comms Device "WhisperNode"',
    description: 'End-to-end encrypted communication device using proprietary quantum-resistant algorithms. Stay off the grid.',
    price: 349.99,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=WhisperNode',
    stock: 25,
    category: 'Secure Hardware',
    productType: 'physical',
  },
  {
    id: 'prod_dig_gen_001',
    name: 'AI-Generated Tech Concept Paper',
    description: 'A unique, short concept paper on a futuristic technology, generated on-demand by our AI core. Each paper is unique.',
    price: 19.99,
    imageUrl: 'https://via.placeholder.com/300x200.png?text=AI+Concept+Paper',
    stock: Infinity, // Digital, generated on demand
    category: 'Digital Intel',
    productType: 'digital',
    digitalAssetConfig: {
      generationPrompt: "Write a compelling and imaginative short (200-300 words) concept paper on a speculative future technology. Choose from one of the following or similar ideas: personalized atmospheric shields, bio-integrated data storage, sentient micro-robot swarms for environmental cleanup, or direct-to-consumer asteroid mining kits. Describe its potential applications, societal impact, and one major ethical consideration. Output as markdown.",
      outputFormat: 'markdown'
    }
  }
];
// Ensure prod_003_emp is not confused with prod_svc_003 for AI Pentest services
export const AI_PENTEST_SERVICE_PRODUCT_IDS = ['prod_svc_001', 'prod_svc_002', 'prod_svc_003'];


export const PENTEST_STATUS_OPTIONS: { value: PentestStatus; label: string }[] = [
    { value: 'Awaiting Target Info', label: 'Awaiting Target Info' },
    { value: 'Target Info Submitted', label: 'Target Info Submitted' },
    { value: 'Processing Request', label: 'Processing Request' },
    { value: 'Information Gathering', label: 'Information Gathering' },
    { value: 'Vulnerability Scanning', label: 'Vulnerability Scanning' },
    { value: 'Analysis & Reporting', label: 'Analysis & Reporting' },
    { value: 'Report Ready', label: 'Report Ready' },
    { value: 'Admin Review', label: 'Admin Review' },
    { value: 'Completed', label: 'Completed' },
];