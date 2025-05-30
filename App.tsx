
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { TechStackConfiguratorView } from './components/TechStackConfiguratorView';
import { ChatView } from './components/ChatView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ShopView } from './components/ShopView';
import { CartView } from './components/CartView';
import { AdminProductManagementView } from './components/AdminProductManagementView';
import LandingPageView from './components/LandingPageView';
import { TargetInfoModal } from './components/TargetInfoModal';
import { PentestOrdersView } from './components/PentestOrdersView';
import { SecurityReportView } from './components/SecurityReportView';
import { AdminPentestOrdersView } from './components/AdminPentestOrdersView';
import { MyDigitalAssetsView } from './components/MyDigitalAssetsView'; 
import AnimatedBackground from './components/ui/AnimatedBackground'; 
import { getCircularReplacer } from './utils/jsonUtils'; // Import the moved function

import { 
  User, AiProviderId, LocalLlmConfig, HuggingFaceConfig, ActiveView, 
  ChatMessage, AiChatStructuredResponse, FileOperation, ParsedBlueprint, 
  ChatMessageImageData, AiAgentMode, GroundingSource, Product, CartItem, 
  ProductFormState, ProductType, ServiceConfig, DigitalAssetConfig, AcquiredDigitalAsset,
  PentestOrder, PentestStatus, PentestTargetInfo, SecurityReport, CustomerFeedback
} from './types';
import { 
  AI_PROVIDER_OPTIONS, GEMINI_MODEL_NAME, HUGGING_FACE_DEFAULT_TEXT_MODEL, 
  LOCAL_LLM_DEFAULT_BASE_URL, LOCAL_LLM_DEFAULT_MODEL_NAME, AI_AGENT_MODES, MOCK_PRODUCTS
} from './constants';

import { sendMessageToGemini, generateSimpleTextWithGemini, resetGeminiChat } from './services/geminiService'; 
import { sendMessageToLocalLlm } from './services/localLlmService';
import { sendMessageToHuggingFace } from './services/huggingFaceService';
import { simulatePentestProcess, generateMockSecurityReport } from './services/mockPentestService';


const LOCAL_STORAGE_PRODUCTS_KEY = 'PROJEKT_CKRYPTBIT_STORE_ASSETS_V1';
const LOCAL_STORAGE_PENTEST_ORDERS_KEY = 'PROJEKT_CKRYPTBIT_PENTEST_ORDERS_V1';
const LOCAL_STORAGE_ACQUIRED_ASSETS_KEY = 'PROJEKT_CKRYPTBIT_ACQUIRED_ASSETS_V1'; 
const VIEW_TRANSITION_DURATION = 250; // ms

// getCircularReplacer function has been moved to utils/jsonUtils.ts

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('landing'); 
  const [isTransitioningView, setIsTransitioningView] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedAiProvider, setSelectedAiProvider] = useState<AiProviderId>('gemini');
  const [localLlmConfig, setLocalLlmConfig] = useState<LocalLlmConfig>({ baseUrl: LOCAL_LLM_DEFAULT_BASE_URL, modelName: LOCAL_LLM_DEFAULT_MODEL_NAME });
  const [huggingFaceConfig, setHuggingFaceConfig] = useState<HuggingFaceConfig>({ modelId: HUGGING_FACE_DEFAULT_TEXT_MODEL, apiKey: '' });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [currentBlueprint, setCurrentBlueprint] = useState<ParsedBlueprint | null>(null);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const storedProducts = localStorage.getItem(LOCAL_STORAGE_PRODUCTS_KEY);
      if (storedProducts) {
        const parsedProducts = JSON.parse(storedProducts);
        if (Array.isArray(parsedProducts) && parsedProducts.every(p => typeof p.id === 'string' && typeof p.name === 'string' && p.productType)) {
          console.log("Assets loaded from LocalStorage.");
          return parsedProducts;
        }
      }
    } catch (error) {
      console.error("Error loading products from LocalStorage:", error);
    }
    console.log("Initializing assets with MOCK_PRODUCTS.");
    return MOCK_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>([]);

  const [pentestOrders, setPentestOrders] = useState<PentestOrder[]>(() => {
    try {
        const storedOrders = localStorage.getItem(LOCAL_STORAGE_PENTEST_ORDERS_KEY);
        if (storedOrders) {
            const parsedOrders: PentestOrder[] = JSON.parse(storedOrders).map((order: any) => ({
                ...order,
                orderDate: order.orderDate ? new Date(order.orderDate) : new Date(), 
                lastAdminUpdateTimestamp: order.lastAdminUpdateTimestamp,
                lastNotificationTimestamp: order.lastNotificationTimestamp, 
                customerNotifiedOfLastAdminUpdate: order.customerNotifiedOfLastAdminUpdate, 
                customerFeedback: order.customerFeedback ? { 
                  ...order.customerFeedback,
                  timestamp: order.customerFeedback.timestamp 
                } : undefined,
                report: order.report ? { 
                    ...order.report, 
                    generatedDate: order.report.generatedDate ? new Date(order.report.generatedDate) : new Date(),
                    targetSummary: order.report.targetSummary ? { ...order.report.targetSummary } : {} 
                } : null
            }));
            if (Array.isArray(parsedOrders)) {
                console.log("Pentest orders loaded from LocalStorage.");
                return parsedOrders;
            }
        }
    } catch (error) {
        console.error("Error loading pentest orders from LocalStorage:", error);
    }
    return [];
  });
  const [activePentestOrder, setActivePentestOrder] = useState<PentestOrder | null>(null);
  const [isTargetInfoModalOpen, setIsTargetInfoModalOpen] = useState(false);

  const [acquiredDigitalAssets, setAcquiredDigitalAssets] = useState<AcquiredDigitalAsset[]>(() => {
    try {
      const storedAssets = localStorage.getItem(LOCAL_STORAGE_ACQUIRED_ASSETS_KEY);
      if (storedAssets) {
        const parsedAssets: AcquiredDigitalAsset[] = JSON.parse(storedAssets).map((asset: any) => ({
          ...asset,
          purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate) : new Date(),
        }));
        if (Array.isArray(parsedAssets)) {
          console.log("Acquired digital assets loaded from LocalStorage.");
          return parsedAssets;
        }
      }
    } catch (error) {
      console.error("Error loading acquired digital assets from LocalStorage:", error);
    }
    return [];
  });

  const handleNavigate = useCallback((newView: ActiveView) => {
    if (activeView === newView && !isTransitioningView) return; 
    setIsTransitioningView(true);
    setTimeout(() => {
      setActiveView(newView);
      setIsTransitioningView(false);
    }, VIEW_TRANSITION_DURATION);
  }, [activeView, isTransitioningView]);


  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_PRODUCTS_KEY, JSON.stringify(products, getCircularReplacer()));
      // console.log("Assets saved to LocalStorage.");
    } catch (error) {
      console.error("Error saving products to LocalStorage:", error);
    }
  }, [products]);

  useEffect(() => {
    try {
      const ordersToSave = pentestOrders.map(order => ({
        ...order,
        orderDate: order.orderDate instanceof Date ? order.orderDate.toISOString() : order.orderDate,
        lastAdminUpdateTimestamp: order.lastAdminUpdateTimestamp, // Keep as string
        lastNotificationTimestamp: order.lastNotificationTimestamp, // Keep as string
        customerFeedback: order.customerFeedback ? {
          ...order.customerFeedback,
          timestamp: order.customerFeedback.timestamp // Keep as string
        } : undefined,
        report: order.report ? {
          ...order.report,
          generatedDate: order.report.generatedDate instanceof Date ? order.report.generatedDate.toISOString() : order.report.generatedDate,
          targetSummary: order.report.targetSummary ? { ...order.report.targetSummary } : {} // Ensure targetSummary is plain object
        } : null,
      }));
      localStorage.setItem(LOCAL_STORAGE_PENTEST_ORDERS_KEY, JSON.stringify(ordersToSave, getCircularReplacer()));
      // console.log("Pentest orders saved to LocalStorage.");
    } catch (error) {
        console.error("Error saving pentest orders to LocalStorage:", error);
    }
  }, [pentestOrders]);

  useEffect(() => {
    try {
      const assetsToSave = acquiredDigitalAssets.map(asset => ({
        ...asset,
        purchaseDate: asset.purchaseDate instanceof Date ? asset.purchaseDate.toISOString() : asset.purchaseDate,
      }));
      localStorage.setItem(LOCAL_STORAGE_ACQUIRED_ASSETS_KEY, JSON.stringify(assetsToSave, getCircularReplacer()));
      // console.log("Acquired digital assets saved to LocalStorage.");
    } catch (error) {
      console.error("Error saving acquired digital assets to LocalStorage:", error);
    }
  }, [acquiredDigitalAssets]);

  const getSelectedAiProviderName = () => {
    return AI_PROVIDER_OPTIONS.find(p => p.id === selectedAiProvider)?.name || "Unknown AI";
  };

  const handleAddProduct = async (productData: Omit<Product, 'id'>): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newProductWithId: Product = {
          ...productData,
          id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        };
        setProducts(prevProducts => [newProductWithId, ...prevProducts]);
        resolve();
      }, 300);
    });
  };

  const handleUpdateProduct = async (updatedProductData: Product): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setProducts(prevProducts =>
          prevProducts.map(p => (p.id === updatedProductData.id ? { ...p, ...updatedProductData } : p))
        );
        resolve();
      }, 300);
    });
  };

  const handleDeleteProduct = async (productId: string): Promise<void> => {
     return new Promise((resolve) => {
      setTimeout(() => {
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        resolve();
      }, 300);
    });
  };

  const handleLogin = (username: string, _password?: string): string | null => { 
    if (username.trim() === '') return "Username cannot be empty.";
    const lowerCaseUsername = username.toLowerCase();
    const user: User = {
      id: `user-${Date.now()}`,
      username: username,
      isAdmin: lowerCaseUsername === 'admin' || lowerCaseUsername === 'root', 
    };
    setIsAuthenticated(true);
    setCurrentUser(user);
    alert(`Login Successful. Welcome ${username}! ${user.isAdmin ? 'Admin access granted to Projekt Ckryptbit.' : 'Access to Projekt Ckryptbit granted.'}`);
    handleNavigate(user.isAdmin ? 'admin_products' : 'shop'); 
    return null; 
  };

  const handleRegister = (username: string, email: string, _password?: string): string | null => {
    if (username.trim() === '' || email.trim() === '') return "Username and email are required.";
    return handleLogin(username); 
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCart([]); 
    alert("Logout Successful from Projekt Ckryptbit.");
    handleNavigate('landing'); 
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    if (quantity <= 0) return;
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === product.id);
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { 
          productId: product.id, 
          name: product.name, 
          price: product.price, 
          quantity,
          imageUrl: product.imageUrl,
          productType: product.productType, 
          serviceConfig: product.serviceConfig,
          digitalAssetConfig: product.digitalAssetConfig 
        }];
      }
    });
    alert(`${product.name} added to carrier.`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart => prevCart.map(item => 
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      ));
    }
  };
  
  const getCartItemCount = (): number => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = (): number => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const handleConfirmAcquisition = () => {
    if (!currentUser) {
        alert("Authentication error. Please log in again.");
        handleNavigate('login');
        return;
    }
    const newPentestOrders: PentestOrder[] = [];
    const digitalAssetsToGenerate: { asset: AcquiredDigitalAsset; prompt: string; outputFormat: DigitalAssetConfig['outputFormat'] }[] = [];
    let firstServiceRequiringInfo: PentestOrder | null = null;

    cart.forEach(item => {
        const productDetails = products.find(p => p.id === item.productId);
        if (!productDetails) {
            console.warn(`Product with ID ${item.productId} not found in products list during acquisition.`);
            return;
        }

        for (let i = 0; i < item.quantity; i++) { 
            if (item.productType === 'service') {
                const newOrder: PentestOrder = {
                    id: `p_ord_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${i}`,
                    userId: currentUser.id,
                    username: currentUser.username,
                    productId: item.productId,
                    productName: item.name,
                    orderDate: new Date(), 
                    targetInfo: null,
                    status: item.serviceConfig?.requiresTargetInfo ? 'Awaiting Target Info' : 'Processing Request',
                    report: null,
                    lastAdminUpdateTimestamp: undefined,
                    customerNotifiedOfLastAdminUpdate: false,
                    lastNotificationTimestamp: undefined,
                    customerFeedback: undefined,
                };
                newPentestOrders.push(newOrder);
                if (item.serviceConfig?.requiresTargetInfo && !firstServiceRequiringInfo) {
                    firstServiceRequiringInfo = newOrder;
                } else if (!item.serviceConfig?.requiresTargetInfo) {
                    startPentestProcessing(newOrder.id, {});
                }
            } else if (item.productType === 'digital' && productDetails.digitalAssetConfig) {
                const newAcquiredAsset: AcquiredDigitalAsset = {
                    id: `da_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${i}`,
                    userId: currentUser.id,
                    username: currentUser.username,
                    productId: item.productId,
                    productName: item.name,
                    purchaseDate: new Date(),
                    generatedContent: null,
                    contentFormat: productDetails.digitalAssetConfig.outputFormat,
                    originalPrompt: productDetails.digitalAssetConfig.generationPrompt,
                    generationStatus: 'pending',
                };
                setAcquiredDigitalAssets(prev => [...prev, newAcquiredAsset]);
                digitalAssetsToGenerate.push({ 
                    asset: newAcquiredAsset, 
                    prompt: productDetails.digitalAssetConfig.generationPrompt,
                    outputFormat: productDetails.digitalAssetConfig.outputFormat 
                });
            }
        }
    });

    if (newPentestOrders.length > 0) {
        setPentestOrders(prev => [...prev, ...newPentestOrders]);
    }

    // Asynchronously generate content for digital assets
    digitalAssetsToGenerate.forEach(async ({ asset, prompt }) => {
        try {
            // Assuming digital asset generation is currently handled by Gemini
            if (!process.env.API_KEY) { 
                 throw new Error("Digital asset generation via Gemini requires API_KEY. AI uplink for generation compromised.");
            }
            const generatedText = await generateSimpleTextWithGemini(prompt);
            setAcquiredDigitalAssets(prev => prev.map(a => 
                a.id === asset.id ? { ...a, generatedContent: generatedText, generationStatus: 'completed' } : a
            ));
        } catch (error) {
            console.error(`Error generating digital asset ${asset.productName}:`, error);
            const errorMessage = error instanceof Error ? error.message : "Unknown AI generation error.";
            setAcquiredDigitalAssets(prev => prev.map(a => 
                a.id === asset.id ? { ...a, generationStatus: 'failed', generationError: errorMessage } : a
            ));
        }
    });


    alert(`Acquisition Initiated. Total: $${getCartTotal().toFixed(2)}. Check relevant sections for status. Your IP has been logged.`);
    setCart([]); 
    
    if (firstServiceRequiringInfo) {
        promptForTargetInfo(firstServiceRequiringInfo);
    } else if (newPentestOrders.length > 0) {
        handleNavigate('pentest_orders');
    } else if (digitalAssetsToGenerate.length > 0) {
        handleNavigate('my_digital_assets');
    } else {
        handleNavigate('shop');
    }
  };

  const promptForTargetInfo = (order: PentestOrder) => {
    setActivePentestOrder(order);
    setIsTargetInfoModalOpen(true);
  };

  const startPentestProcessing = useCallback(async (orderId: string, targetInfo: PentestTargetInfo) => {
    setPentestOrders(prevOrders =>
      prevOrders.map(o => 
        o.id === orderId ? { ...o, targetInfo: targetInfo, status: 'Processing Request' as PentestStatus } : o
      )
    );
    setIsTargetInfoModalOpen(false);
    setActivePentestOrder(null);

    const updateStatus = (status: PentestStatus) => {
        setPentestOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    };

    try {
        await simulatePentestProcess(updateStatus, 500); 
        
        setPentestOrders(prevOrders => {
            const orderForReport = prevOrders.find(o => o.id === orderId);
            
            if (orderForReport && orderForReport.targetInfo) { 
               const report = generateMockSecurityReport(orderForReport.targetInfo, orderForReport.productName); 
                return prevOrders.map(o => 
                    o.id === orderId ? { ...o, report, status: 'Report Ready' as PentestStatus } : o
                );
            } else {
                 console.error("Could not generate report for order ID:", orderId, ". Order found in prevOrders:", !!orderForReport, ", Target info present:", orderForReport ? !!orderForReport.targetInfo : 'N/A');
                 return prevOrders.map(o => 
                    o.id === orderId ? { ...o, status: 'Completed' as PentestStatus } : o // Fallback status
                );
            }
        });
    } catch (e) {
        console.error("Error during simulated pentest process for order", orderId, e);
        setPentestOrders(prevOrders => 
            prevOrders.map(o => 
                o.id === orderId ? { ...o, status: 'Completed' as PentestStatus } : o // Fallback status
            )
        );
    }
  }, []); 

  const viewSecurityReport = (order: PentestOrder) => {
    setActivePentestOrder(order);
    handleNavigate('security_report');
  };
  
  const handleUpdatePentestOrderStatusByAdmin = (orderId: string, newStatus: PentestStatus, adminNotes?: string) => {
    setPentestOrders(prevOrders =>
        prevOrders.map(o => {
            if (o.id === orderId) {
                const updatedOrder: PentestOrder = { 
                    ...o, 
                    status: newStatus,
                    lastAdminUpdateTimestamp: new Date().toISOString(),
                    customerNotifiedOfLastAdminUpdate: false, 
                };
                if (adminNotes !== undefined) { 
                    updatedOrder.adminNotes = adminNotes;
                }
                return updatedOrder;
            }
            return o;
        })
    );
  };

  const handleAdminNotifyCustomer = (orderId: string) => {
    setPentestOrders(prevOrders =>
        prevOrders.map(o =>
            o.id === orderId ? { 
                ...o, 
                customerNotifiedOfLastAdminUpdate: true,
                lastNotificationTimestamp: new Date().toISOString() 
            } : o
        )
    );
    alert(`Customer for order ${orderId.substring(0,8)}... (simulated) notification sent regarding last update.`);
  };

  const handleAcknowledgeAdminUpdate = (orderId: string) => {
    setPentestOrders(prevOrders =>
        prevOrders.map(o => {
            if (o.id === orderId && o.lastAdminUpdateTimestamp) {
                return {
                    ...o,
                    customerNotifiedOfLastAdminUpdate: true, 
                    lastNotificationTimestamp: o.lastAdminUpdateTimestamp 
                };
            }
            return o;
        })
    );
  };

  const handlePentestReportFeedback = (orderId: string, rating: number, comment: string) => {
    setPentestOrders(prevOrders =>
      prevOrders.map(o =>
        o.id === orderId
          ? {
              ...o,
              customerFeedback: {
                rating,
                comment,
                timestamp: new Date().toISOString(),
              },
            }
          : o
      )
    );
  };

  const getChatWelcomeMessage = useCallback((providerName: string, view: ActiveView): ChatMessage => {
    const commonWelcomeContent = `Connection established with: ${providerName}. System Online. Awaiting command...`;
    return {
      id: `system-intro-${selectedAiProvider}-${view}-${Date.now()}`, // Ensure unique ID
      sender: 'ai',
      content: commonWelcomeContent,
      timestamp: new Date(),
      aiProviderName: providerName || "AI System",
    };
  }, [selectedAiProvider]);

  const handleClearChatHistory = useCallback(() => {
    const providerName = getSelectedAiProviderName();
    setChatMessages([getChatWelcomeMessage(providerName, activeView)]);
    setChatError(null);
    setIsChatLoading(false);
    resetGeminiChat(); // Reset chat session for Gemini
    // Potentially add reset logic for other providers if they maintain state
  }, [activeView, selectedAiProvider, getChatWelcomeMessage]);


  useEffect(() => {
    if (activeView !== 'chat' && activeView !== 'architect' && activeView !== 'workspace') return;
    const providerName = getSelectedAiProviderName();
    setChatMessages(prevMessages => {
        const welcomeMessage = getChatWelcomeMessage(providerName, activeView);
        // If messages empty, or last message is not a system intro, or it's a different system intro
        if (prevMessages.length === 0 || !prevMessages[prevMessages.length - 1].id.startsWith('system-intro-')) {
            return [welcomeMessage];
        }
        // If last message is a system intro but for a different provider/view, replace it
        if (prevMessages[prevMessages.length - 1].id.startsWith('system-intro-') && prevMessages[prevMessages.length - 1].id !== welcomeMessage.id.substring(0, welcomeMessage.id.lastIndexOf('-')) ) {
             // To avoid issues with Date.now() in welcomeMessage.id making them always different, compare the base part
             const basePrevId = prevMessages[prevMessages.length - 1].id.substring(0, prevMessages[prevMessages.length - 1].id.lastIndexOf('-'));
             const baseNewId = welcomeMessage.id.substring(0, welcomeMessage.id.lastIndexOf('-'));
             if(basePrevId !== baseNewId) {
                return [...prevMessages.slice(0, -1), welcomeMessage];
             }
        }
        return prevMessages; // No change needed
    });
  }, [activeView, selectedAiProvider, getSelectedAiProviderName, getChatWelcomeMessage]); 

  const handleApplyFileOpsToBlueprint = (fileOps: FileOperation[]) => {
    if (!currentBlueprint) {
        console.warn("Attempted to apply file operations but no blueprint is active.");
        return;
    }
    setCurrentBlueprint(prevBlueprint => {
        if (!prevBlueprint) return null;
        let newSuggestedFiles = [...prevBlueprint.suggestedFiles];
        fileOps.forEach(op => {
            const fileIndex = newSuggestedFiles.findIndex(f => f.name === op.fileName);
            if (op.action === 'create') {
                if (fileIndex === -1) {
                    newSuggestedFiles.push({ name: op.fileName, language: op.language || 'plaintext', content: op.content || '' });
                } else { 
                    newSuggestedFiles[fileIndex] = { ...newSuggestedFiles[fileIndex], content: op.content || newSuggestedFiles[fileIndex].content, language: op.language || newSuggestedFiles[fileIndex].language };
                }
            } else if (op.action === 'update') {
                if (fileIndex !== -1) {
                    newSuggestedFiles[fileIndex] = { ...newSuggestedFiles[fileIndex], content: op.content !== undefined ? op.content : newSuggestedFiles[fileIndex].content };
                } else {
                     newSuggestedFiles.push({ name: op.fileName, language: op.language || 'plaintext', content: op.content || '' });
                }
            } else if (op.action === 'delete') {
                if (fileIndex !== -1) newSuggestedFiles.splice(fileIndex, 1);
            }
        });
        return { ...prevBlueprint, suggestedFiles: newSuggestedFiles };
    });
  };

  const handleSendChatMessage = async (
    userInput: string, 
    imageData?: ChatMessageImageData | null, 
    agentMode: AiAgentMode = 'default',
    selectedCode?: string | null
  ) => {
    if (!userInput.trim() && !imageData) return;
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`, sender: 'user', content: userInput,
      imageData: imageData || null, timestamp: new Date(),
    };
    setChatMessages(prev => {
        const newMessages = [...prev, userMessage];
        const aiLoadingMessage: ChatMessage = {
            id: `ai-loading-${Date.now()}`, sender: 'ai', content: 'Processing Request Matrix...', 
            timestamp: new Date(), isLoading: true, aiProviderName: getSelectedAiProviderName(),
        };
        newMessages.push(aiLoadingMessage);
        return newMessages;
    });
    setIsChatLoading(true); 
    setChatError(null);
    
    let userInputForAI = userInput;
    const modeConfig = AI_AGENT_MODES.find(m => m.id === agentMode);

    if (modeConfig) {
      let prefix = "";
      // Always add TASK_MODE if a mode is selected (even 'default' if we want specific handling)
      // The current structure implies if modeConfig is found, its instruction is relevant.
      // If selectedCode is present, it's always added with its prefix.
      // For 'default' mode without selected code, no prefix is added.
      if (agentMode !== 'default' || selectedCode || userInput.startsWith("SYSTEM_COMMAND:")) {
          prefix = `TASK_MODE: ${modeConfig.instruction}\n`;
          if (userInput.startsWith("SYSTEM_COMMAND:")) { // Prioritize system commands
              prefix = ""; // Don't add TASK_MODE for explicit system commands
          }
      }
      if (selectedCode) {
          prefix += `SELECTED_CODE:\n---\n${selectedCode}\n---\n`;
      }
      userInputForAI = `${prefix}USER_QUERY: ${userInput}`;
    }


    try {
      let rawAiResponseText = '';
      let groundingSourcesForDisplay: GroundingSource[] | undefined | null = null;
      const historyForAI = chatMessages.filter(m => !m.isLoading && m.id !== `ai-loading-${userMessage.timestamp.getTime()}`); 
      const currentConversationHistory = [...historyForAI, userMessage];
      switch (selectedAiProvider) {
        case 'gemini':
          if (!process.env.API_KEY) throw new Error("CRITICAL FAILURE: Google Gemini API key (API_KEY) is not configured. System compromised.");
          const geminiResponse = await sendMessageToGemini(userInputForAI, currentConversationHistory, agentMode, imageData);
          rawAiResponseText = geminiResponse.text;
          groundingSourcesForDisplay = geminiResponse.groundingSources;
          break;
        case 'local_llm':
          if (!localLlmConfig.baseUrl || !localLlmConfig.modelName) throw new Error("Local LLM endpoint and model identifier are mandatory.");
          rawAiResponseText = await sendMessageToLocalLlm(userInputForAI, currentConversationHistory, localLlmConfig.baseUrl, localLlmConfig.modelName);
          break;
        case 'huggingface':
          if (!huggingFaceConfig.modelId) throw new Error("Hugging Face Model ID is required for node access.");
          rawAiResponseText = await sendMessageToHuggingFace(userInputForAI, currentConversationHistory, huggingFaceConfig.modelId, huggingFaceConfig.apiKey);
          break;
        default: throw new Error("No valid AI uplink detected. Select provider.");
      }
      let aiStructuredResponse: AiChatStructuredResponse | null = null;
      let textualContentForDisplay = `ERROR: AI response matrix unreadable.`; 
      if (selectedAiProvider === 'gemini' && agentMode === 'research_oracle') {
        textualContentForDisplay = rawAiResponseText;
        aiStructuredResponse = { type: 'textResponse', message: rawAiResponseText };
      } else {
        try {
          let cleanedJsonText = rawAiResponseText.trim();
          const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
          const match = cleanedJsonText.match(fenceRegex);
          if (match && match[2]) cleanedJsonText = match[2].trim();
          aiStructuredResponse = JSON.parse(cleanedJsonText) as AiChatStructuredResponse;
        } catch (parseError) {
          aiStructuredResponse = { type: 'textResponse', message: rawAiResponseText };
        }
        if (!aiStructuredResponse || typeof aiStructuredResponse.type !== 'string') {
           aiStructuredResponse = { type: 'textResponse', message: "Received corrupted data packet from AI." };
        }
        textualContentForDisplay = aiStructuredResponse.message || (aiStructuredResponse.type === 'fileOperation' ? "File system operation executed." : "No verbal response from AI matrix.");
      }
      if (aiStructuredResponse.type === 'fileOperation' && aiStructuredResponse.fileOps && currentBlueprint) {
        handleApplyFileOpsToBlueprint(aiStructuredResponse.fileOps);
      }
      const aiResponseMessage: ChatMessage = {
        id: `ai-resp-${Date.now()}`, sender: 'ai', content: textualContentForDisplay,
        timestamp: new Date(), imageData: null, groundingSources: groundingSourcesForDisplay,
        aiProviderName: getSelectedAiProviderName(),
      };
      setChatMessages(prev => prev.map(msg => msg.isLoading ? aiResponseMessage : msg));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown system fault in chat module.";
      setChatError(errorMsg);
      const aiErrorMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`, sender: 'ai', content: `SYSTEM ALERT: ${errorMsg}`,
        timestamp: new Date(), aiProviderName: getSelectedAiProviderName(),
      };
      setChatMessages(prev => prev.map(msg => msg.isLoading ? aiErrorMessage : msg));
    } finally { setIsChatLoading(false); }
  };

  useEffect(() => {
    const allowedUnauthenticatedViews: ActiveView[] = ['landing', 'login', 'register', 'architect', 'chat'];
    if (!isAuthenticated && !allowedUnauthenticatedViews.includes(activeView)) {
      handleNavigate('landing');
    }
    if (isAuthenticated && (activeView === 'login' || activeView === 'register')) {
        handleNavigate(currentUser?.isAdmin ? 'admin_products' : 'shop');
    }
    if (isAuthenticated && activeView === 'landing' && currentUser && !isTransitioningView) {
        handleNavigate(currentUser.isAdmin ? 'admin_products' : 'shop');
    }
  }, [isAuthenticated, activeView, currentUser, handleNavigate, isTransitioningView]);


  return (
    <div className="min-h-screen flex flex-col bg-transparent text-neutral-light font-mono">
      <AnimatedBackground isTransitioningView={isTransitioningView} />
      <Header 
        activeView={activeView} 
        setActiveView={handleNavigate} 
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLogout={handleLogout}
        cartItemCount={getCartItemCount()}
      />
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-6 sm:py-8 w-full">
        {activeView === 'landing' && (
          <LandingPageView 
            setActiveView={handleNavigate}
            isAuthenticated={isAuthenticated}
            currentUser={currentUser}
          />
        )}
        {activeView === 'architect' && (
          <TechStackConfiguratorView
            selectedAiProvider={selectedAiProvider}
            setSelectedAiProvider={setSelectedAiProvider}
            localLlmConfig={localLlmConfig}
            setLocalLlmConfig={setLocalLlmConfig}
            huggingFaceConfig={huggingFaceConfig}
            setHuggingFaceConfig={setHuggingFaceConfig}
            chatMessages={chatMessages} 
            onSendChatMessage={handleSendChatMessage} 
            isChatLoading={isChatLoading}
            chatError={chatError}
            currentChatProviderName={getSelectedAiProviderName()}
            currentBlueprint={currentBlueprint}
            setCurrentBlueprint={setCurrentBlueprint}
            onApplyFileOpsToBlueprint={handleApplyFileOpsToBlueprint}
            onClearChatHistory={handleClearChatHistory} 
          />
        )}
        {activeView === 'chat' && (
          <ChatView
            messages={chatMessages}
            onSendMessage={handleSendChatMessage}
            isLoading={isChatLoading} 
            error={chatError}
            currentProviderName={getSelectedAiProviderName()}
            selectedAiProvider={selectedAiProvider}
            setSelectedAiProvider={setSelectedAiProvider}
            localLlmConfig={localLlmConfig}
            setLocalLlmConfig={setLocalLlmConfig}
            huggingFaceConfig={huggingFaceConfig}
            setHuggingFaceConfig={setHuggingFaceConfig}
            onClearChatHistory={handleClearChatHistory}
          />
        )}
        {activeView === 'login' && !isAuthenticated && <LoginView onLogin={handleLogin} setActiveView={handleNavigate} />}
        {activeView === 'register' && !isAuthenticated && <RegisterView onRegister={handleRegister} setActiveView={handleNavigate} />}
        
        {activeView === 'shop' && isAuthenticated && (
          <ShopView products={products} onAddToCart={addToCart} />
        )}
        {activeView === 'cart' && isAuthenticated && (
          <CartView 
            cartItems={cart} 
            onUpdateQuantity={updateCartQuantity} 
            onRemoveItem={removeFromCart} 
            cartTotal={getCartTotal()}
            setActiveView={handleNavigate}
            onConfirmAcquisition={handleConfirmAcquisition}
          />
        )}
        {activeView === 'admin_products' && isAuthenticated && currentUser?.isAdmin && (
          <AdminProductManagementView 
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {activeView === 'pentest_orders' && isAuthenticated && (
            <PentestOrdersView
                orders={pentestOrders.filter(o => o.userId === currentUser?.id)}
                onViewReport={viewSecurityReport}
                onProvideTargetInfo={promptForTargetInfo}
                onAcknowledgeAdminUpdate={handleAcknowledgeAdminUpdate}
            />
        )}
        {activeView === 'security_report' && isAuthenticated && activePentestOrder && (
            <SecurityReportView
                report={activePentestOrder.report}
                order={activePentestOrder}
                onClose={() => {
                    setActivePentestOrder(null);
                    handleNavigate(currentUser?.isAdmin && activeView === 'security_report' ? 'admin_pentest_orders' : 'pentest_orders');
                }}
                onFeedbackSubmit={currentUser?.id === activePentestOrder.userId ? handlePentestReportFeedback : undefined}
            />
        )}
        {activeView === 'admin_pentest_orders' && isAuthenticated && currentUser?.isAdmin && (
            <AdminPentestOrdersView
                orders={pentestOrders}
                onUpdateStatus={handleUpdatePentestOrderStatusByAdmin}
                onViewReport={viewSecurityReport}
                onNotifyCustomer={handleAdminNotifyCustomer}
            />
        )}
        {activeView === 'my_digital_assets' && isAuthenticated && currentUser && (
            <MyDigitalAssetsView
                acquiredAssets={acquiredDigitalAssets.filter(asset => asset.userId === currentUser.id)}
                currentUsername={currentUser.username}
            />
        )}

      </main>
      <Footer />
      {isTargetInfoModalOpen && activePentestOrder && (
        <TargetInfoModal
            isOpen={isTargetInfoModalOpen}
            onClose={() => {
                setIsTargetInfoModalOpen(false);
                setActivePentestOrder(null);
            }}
            onSubmit={(targetInfo) => startPentestProcessing(activePentestOrder.id, targetInfo)}
            productName={activePentestOrder.productName}
        />
      )}
    </div>
  );
};

export default App;
