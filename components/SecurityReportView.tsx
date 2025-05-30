
import React, { useState } from 'react';
import { SecurityReport, PentestFinding, PentestOrder, CustomerFeedback, AdaptiveDefenseLogEntry } from '../types';
import { Button } from './ui/Button';
import { TextInput } from './ui/TextInput';
import { renderEnhancedMarkdown } from '../utils/markdownRenderer';
import { downloadReportAsPdf } from '../utils/reportGenerator'; 

// --- SVG Icons ---
const ReportIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75c0-.231-.035-.454-.1-.664M6.75 7.5h10.5a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-7.5a2.25 2.25 0 012.25-2.25z" />
  </svg>
);

const SummaryIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

const FindingsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronRightIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const DescriptionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
  </svg>
);

const CweIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>
);

const EvidenceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
  </svg>
);

const RecommendationIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExploitPathIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h18M7.5 3L12 7.5m0 0L16.5 3M12 7.5v13.5" />
  </svg>
);

const AdaptiveDefenseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068M15.75 21H8.25A2.25 2.25 0 016 18.75V5.25A2.25 2.25 0 018.25 3h7.5a2.25 2.25 0 012.25 2.25v9.75c0 .634-.255 1.223-.672 1.658M12 12V3M12 12l-6 6" />
  </svg>
);

const ActionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => ( // For adaptive defense log entry
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.73-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.63-6.837L17.25 3A2.652 2.652 0 0021 8.75l-5.877 5.877m0 0a3.182 3.182 0 01-4.5 0l-2.496-3.03c-.317-.384-.73-.626-1.208-.766M3 21l3.586-3.586" />
  </svg>
);

const ConfidenceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MethodologyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);


// --- Components ---
const SeverityPill: React.FC<{ severity: PentestFinding['severity'] }> = ({ severity }) => {
  let bgColor = 'bg-neutral-medium';
  let textColor = 'text-neutral-darkest';

  switch (severity) {
    case 'Critical': bgColor = 'bg-red-600 hover:bg-red-500'; textColor = 'text-white'; break;
    case 'High': bgColor = 'bg-orange-500 hover:bg-orange-400'; textColor = 'text-white'; break;
    case 'Medium': bgColor = 'bg-yellow-500 hover:bg-yellow-400'; textColor = 'text-yellow-900'; break;
    case 'Low': bgColor = 'bg-sky-500 hover:bg-sky-400'; textColor = 'text-sky-100'; break;
    case 'Informational': bgColor = 'bg-gray-500 hover:bg-gray-400'; textColor = 'text-gray-100'; break;
  }
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${bgColor} ${textColor} whitespace-nowrap shadow-sm transition-colors`}>
      {severity.toUpperCase()}
    </span>
  );
};

const StarIcon: React.FC<React.SVGProps<SVGSVGElement> & { filled: boolean }> = ({ filled, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.5} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.82.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.82-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
  </svg>
);


interface SecurityReportViewProps {
  report: SecurityReport | null;
  order: PentestOrder; 
  onClose: () => void;
  onFeedbackSubmit?: (orderId: string, rating: number, comment: string) => void; 
}

export const SecurityReportView: React.FC<SecurityReportViewProps> = ({ report, order, onClose, onFeedbackSubmit }) => {
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackForm, setShowFeedbackForm] = useState(!order.customerFeedback && !!onFeedbackSubmit);
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});

  const toggleFinding = (findingId: string) => {
    setExpandedFindings(prev => ({ ...prev, [findingId]: !prev[findingId] }));
  };

  if (!report) {
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-bold text-neonMagenta-DEFAULT mb-4">REPORT DATA CORRUPTED OR UNAVAILABLE</h1>
        <p className="text-neutral-light mb-6">The security report for order <span className="text-neonCyan-light">{order.id}</span> could not be loaded.</p>
        <Button onClick={onClose} variant="primary">
          RETURN TO ORDERS
        </Button>
      </div>
    );
  }

  const handleDownloadReport = () => {
    if (report) {
      downloadReportAsPdf(report, order);
    }
  };

  const handleStarClick = (rating: number) => {
    setFeedbackRating(rating);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating > 0 && onFeedbackSubmit) {
      onFeedbackSubmit(order.id, feedbackRating, feedbackComment);
      setShowFeedbackForm(false); 
      alert("Feedback protocol engaged. Transmission received.");
    } else {
      alert("Rating is mandatory for feedback protocol.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-neutral-darker shadow-2xl rounded-md border-2 border-neonGreen-dark font-mono">
      <header className="mb-6 pb-3 border-b-2 border-neutral-dark">
        <div className="flex justify-between items-start">
            <div className="flex items-center mb-2 sm:mb-0">
                <ReportIcon className="w-8 h-8 mr-2 text-neonGreen-DEFAULT flex-shrink-0"/>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neonGreen-DEFAULT">
                      <span className="typing-text animate-typing">KI-DRIVEN SECURITY REPORT</span>
                      <span className="typing-caret"></span>
                    </h1>
                    <p className="text-xs text-neonCyan-light">Service: {order.productName}</p>
                    <p className="text-xs text-neonCyan-light">Target: {report.targetSummary.targetUrl || report.targetSummary.targetIp || 'N/A'}</p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
                <Button onClick={handleDownloadReport} variant="primary" size="sm" className="shadow-neon-green-glow">DOWNLOAD REPORT (TXT)</Button>
                <Button onClick={onClose} variant="outline" size="sm" className="border-neonMagenta-DEFAULT text-neonMagenta-DEFAULT hover:bg-neonMagenta-DEFAULT hover:text-black">CLOSE REPORT</Button>
            </div>
        </div>
        <div className="mt-2 text-xs text-neutral-light">
            Report ID: <span className="text-neonGreen-light">{report.reportId}</span> | Generated: <span className="text-neonGreen-light">{new Date(report.generatedDate).toLocaleString()}</span>
            {report.overallRiskScore !== undefined && 
              <span className="ml-2 px-1.5 py-0.5 bg-neutral-dark rounded-sm">Overall Risk (Simulated): <span className="font-bold text-neonGreen-light">{report.overallRiskScore}/10</span></span>
            }
        </div>
      </header>

      <section className="mb-5 p-3 bg-neutral-dark rounded-sm border border-neutral-medium shadow-inner relative scanline-container overflow-hidden">
        <div className="scanline-overlay" style={{ '--scanline-color': 'rgba(0, 255, 255, 0.05)' } as React.CSSProperties}></div>
        <h2 className="text-lg font-semibold text-neonCyan-DEFAULT mb-1.5 flex items-center">
            <SummaryIcon className="w-5 h-5 mr-2"/>
            <span className="typing-text animate-typingFast" style={{animationDuration: '0.8s'}}>Executive Summary:</span><span className="typing-caret" style={{animationDelay: '0.8s'}}></span>
        </h2>
        <div className="text-sm text-neutral-light leading-relaxed prose prose-sm prose-invert max-w-none">
            {renderEnhancedMarkdown(report.executiveSummary)}
        </div>
      </section>
      
      <section className="mb-5">
        <h2 className="text-lg font-semibold text-neonCyan-DEFAULT mb-2 flex items-center">
            <FindingsIcon className="w-5 h-5 mr-2"/>
            <span className="typing-text animate-typingFast" style={{animationDuration: '0.9s'}}>Detailed Findings ({report.findings.length}):</span><span className="typing-caret" style={{animationDelay: '0.9s'}}></span>
        </h2>
        {report.findings.length === 0 ? (
            <p className="text-neutral-medium p-3 bg-neutral-dark rounded-sm border border-neutral-medium">No significant vulnerabilities identified in this simulated scan.</p>
        ) : (
            <div className="space-y-3">
            {report.findings.map(finding => (
                <div key={finding.id} className="p-3 bg-neutral-dark rounded-sm border border-neutral-medium shadow-md relative scanline-container overflow-hidden">
                  <div className="scanline-overlay" style={{ '--scanline-color': 'rgba(0, 255, 0, 0.03)' } as React.CSSProperties}></div>
                  <button 
                    onClick={() => toggleFinding(finding.id)} 
                    className="w-full flex justify-between items-center text-left focus:outline-none mb-1"
                    aria-expanded={!!expandedFindings[finding.id]}
                    aria-controls={`finding-details-${finding.id}`}
                  >
                      <h3 className="text-md font-semibold text-neonGreen-light mr-2 flex items-center">
                        {expandedFindings[finding.id] ? <ChevronDownIcon className="w-4 h-4 mr-1.5 text-neonCyan-light"/> : <ChevronRightIcon className="w-4 h-4 mr-1.5 text-neonCyan-light"/>}
                        {finding.title}
                      </h3>
                      <SeverityPill severity={finding.severity} />
                  </button>
                  
                  {expandedFindings[finding.id] && (
                    <div id={`finding-details-${finding.id}`} className="mt-1.5 pl-2 border-l-2 border-neutral-medium/50 space-y-2.5 text-xs">
                      {finding.cwe && (
                        <div className="flex items-start" title={`Common Weakness Enumeration: ${finding.cwe}`}>
                            <CweIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-neonMagenta-light flex-shrink-0"/>
                            <p className="text-neonMagenta-light"><span className="font-semibold">CWE:</span> {finding.cwe}</p>
                        </div>
                      )}
                      <div className="flex items-start">
                        <DescriptionIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-neonCyan-light flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold text-neonCyan-light mb-0.5">Description:</h4>
                            <p className="text-neutral-light whitespace-pre-wrap leading-relaxed">{finding.description}</p>
                        </div>
                      </div>
                      
                      {finding.mockEvidence && (
                        <div className="flex items-start">
                            <EvidenceIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-neonCyan-light flex-shrink-0"/>
                            <div>
                                <h4 className="font-semibold text-neonCyan-light mb-0.5">Simulated Evidence:</h4>
                                <pre className="text-neutral-light whitespace-pre-wrap bg-neutral-darkest p-1.5 rounded-sm border border-neutral-medium max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-medium">{finding.mockEvidence}</pre>
                            </div>
                        </div>
                      )}

                      {finding.recommendation && (
                          <div className="flex items-start">
                              <RecommendationIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-neonCyan-light flex-shrink-0"/>
                              <div>
                                  <h4 className="font-semibold text-neonCyan-light mb-0.5">Recommendation Protocol:</h4>
                                  <p className="text-neutral-light whitespace-pre-wrap leading-relaxed">{finding.recommendation}</p>
                              </div>
                          </div>
                      )}

                      {finding.mockMitigationSteps && finding.mockMitigationSteps.length > 0 && (
                        <div className="flex items-start">
                            <RecommendationIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-neonCyan-light flex-shrink-0"/>
                             <div>
                                <h4 className="font-semibold text-neonCyan-light mb-0.5">Simulated Mitigation Steps:</h4>
                                <ul className="list-decimal list-inside text-neutral-light space-y-0.5 pl-1">
                                    {finding.mockMitigationSteps.map((step, idx) => <li key={idx}>{step}</li>)}
                                </ul>
                            </div>
                        </div>
                      )}

                      {Array.isArray(finding.simulatedExploitPath) && finding.simulatedExploitPath.length > 0 && (
                        <div className="flex items-start">
                          <ExploitPathIcon className="w-3.5 h-3.5 mr-1.5 mt-0.5 text-neonMagenta-light flex-shrink-0"/>
                          <div>
                            <h4 className="font-semibold text-neonMagenta-light mb-0.5">Simulated Exploit Path:</h4>
                            <ol className="list-decimal list-inside text-neutral-light space-y-0.5 pl-1">
                              {finding.simulatedExploitPath.map((step, idx) => <li key={idx} className="italic">{step}</li>)}
                            </ol>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
            ))}
            </div>
        )}
      </section>

      {/* Global Adaptive Defense Simulation Section */}
      {report.adaptiveDefenseSimulation && report.adaptiveDefenseSimulation.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-semibold text-neonCyan-DEFAULT mb-2 flex items-center">
            <AdaptiveDefenseIcon className="w-5 h-5 mr-2" /> 
            <span className="typing-text animate-typingFast" style={{animationDuration: '1s'}}>KI Adaptive Defense Simulation:</span><span className="typing-caret" style={{animationDelay: '1s'}}></span>
          </h2>
          <div className="space-y-2.5">
            {report.adaptiveDefenseSimulation.map((defense, idx) => (
              <div key={idx} className="p-2.5 bg-neutral-dark rounded-sm border border-neutral-medium shadow-sm text-xs relative scanline-container overflow-hidden">
                <div className="scanline-overlay" style={{ '--scanline-color': 'rgba(0, 255, 255, 0.04)' } as React.CSSProperties}></div>
                <div className="flex items-center mb-1">
                  <ActionIcon className="w-3.5 h-3.5 mr-1.5 text-neonGreen-light flex-shrink-0" />
                  <p className="font-semibold text-neonGreen-light">{defense.action}</p>
                </div>
                <p className="text-neutral-light ml-5 mb-0.5 pl-0.5 border-l border-neutral-medium/50">
                  <span className="font-medium text-neonCyan-light">Details:</span> {defense.detail}
                </p>
                <p className="text-neutral-light ml-5 mb-0.5 pl-0.5 border-l border-neutral-medium/50">
                  <span className="font-medium text-neonCyan-light">Simulated Effect:</span> {defense.simulatedEffect}
                </p>
                <div className="flex items-center text-neutral-light ml-5 pl-0.5 border-l border-neutral-medium/50">
                  <ConfidenceIcon className="w-3.5 h-3.5 mr-1 text-neonCyan-light flex-shrink-0" />
                  <span className="font-medium text-neonCyan-light">Confidence:</span>&nbsp;
                  <span className={
                    defense.confidence === 'High' ? 'text-neonGreen-DEFAULT font-semibold' :
                    defense.confidence === 'Medium' ? 'text-yellow-400 font-semibold' :
                    'text-neonMagenta-light font-semibold'
                  }>{defense.confidence}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      {showFeedbackForm && (
        <section className="mt-6 pt-4 border-t-2 border-neutral-medium">
          <h2 className="text-lg font-semibold text-neonCyan-DEFAULT mb-2">
            <span className="typing-text animate-typingFast" style={{animationDuration: '1.2s'}}>Report Feedback Protocol:</span><span className="typing-caret" style={{animationDelay: '1.2s'}}></span>
          </h2>
          <form onSubmit={handleFeedbackSubmit} className="p-3 bg-neutral-dark rounded-sm border border-neutral-medium space-y-3 relative scanline-container overflow-hidden">
            <div className="scanline-overlay" style={{ '--scanline-color': 'rgba(0, 255, 0, 0.05)' } as React.CSSProperties}></div>
            <div>
              <label className="block text-xs font-medium text-neonCyan-light mb-1">Report Rating (1-5 Stars):</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star} type="button" onClick={() => handleStarClick(star)}
                    className={`p-1 focus:outline-none rounded-sm ${feedbackRating >= star ? 'text-neonGreen-DEFAULT' : 'text-neutral-medium hover:text-neonGreen-light'}`}
                    aria-label={`Rate ${star} star`}
                  > <StarIcon filled={feedbackRating >= star} className="w-6 h-6" /> </button>
                ))}
              </div>
            </div>
            <TextInput label="Comments / Observations (Optional):" id="feedback-comment" type="textarea" value={feedbackComment} onChange={setFeedbackComment} placeholder="Provide additional details or observations..." rows={3}/>
            <Button type="submit" variant="primary" size="sm">SUBMIT FEEDBACK</Button>
          </form>
        </section>
      )}

      {order.customerFeedback && !showFeedbackForm && (
         <section className="mt-6 pt-4 border-t-2 border-neutral-medium">
          <h2 className="text-lg font-semibold text-neonCyan-DEFAULT mb-2">
            <span className="typing-text animate-typingFast" style={{animationDuration: '1.1s'}}>Your Submitted Feedback:</span><span className="typing-caret" style={{animationDelay: '1.1s'}}></span>
          </h2>
           <div className="p-3 bg-neutral-dark rounded-sm border border-neutral-medium relative scanline-container overflow-hidden">
            <div className="scanline-overlay" style={{ '--scanline-color': 'rgba(0, 255, 255, 0.03)' } as React.CSSProperties}></div>
            <div className="flex items-center mb-1">
                <span className="text-xs font-medium text-neonCyan-light mr-2">Rating:</span>
                 <div className="flex space-x-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (<StarIcon key={star} filled={order.customerFeedback!.rating >= star} className="w-4 h-4 text-neonGreen-DEFAULT" />))}
                </div>
            </div>
            <p className="text-xs text-neonCyan-light">Comment: <span className="text-neutral-light italic">{order.customerFeedback.comment || "No comment provided."}</span></p>
            <p className="text-xs text-neutral-medium mt-1">Submitted: {new Date(order.customerFeedback.timestamp).toLocaleString()}</p>
           </div>
        </section>
      )}

      {report.methodology &&
        <section className="mt-5 pt-3 border-t border-neutral-medium">
            <h2 className="text-sm font-semibold text-neonCyan-DEFAULT mb-1 flex items-center">
                <MethodologyIcon className="w-4 h-4 mr-1.5"/>Methodology Notes:
            </h2>
            <p className="text-xs text-neutral-medium italic">{report.methodology}</p>
        </section>
      }
       <p className="text-center text-[0.7rem] text-neutral-medium mt-6">
            This is a simulated report for demonstration purposes. All findings are illustrative.
        </p>
    </div>
  );
};
