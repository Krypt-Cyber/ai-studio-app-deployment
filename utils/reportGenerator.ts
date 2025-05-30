
import { SecurityReport, PentestOrder, PentestFinding } from '../types';

const formatFindingForPdf = (finding: PentestFinding): string => {
  let content = `Severity: ${finding.severity}\n`;
  content += `Title: ${finding.title}\n`;
  if (finding.cwe) {
    content += `CWE: ${finding.cwe}\n`;
  }
  content += `Description:\n${finding.description}\n`;
  if (finding.recommendation) {
    content += `Recommendation Protocol:\n${finding.recommendation}\n`;
  }
  if (Array.isArray(finding.mockMitigationSteps) && finding.mockMitigationSteps.length > 0) {
    content += `Simulated Mitigation Steps:\n${finding.mockMitigationSteps.map((step, i) => `${i+1}. ${step}`).join('\n')}\n`;
  }
  if (Array.isArray(finding.simulatedExploitPath) && finding.simulatedExploitPath.length > 0) {
    content += `Simulated Exploit Path:\n${finding.simulatedExploitPath.map((step, i) => `${i+1}. ${step}`).join('\n')}\n`;
  }
  if(finding.mockEvidence) {
    content += `Simulated Evidence:\n${finding.mockEvidence}\n`
  }
  return content;
};

export const generateMockPdfContent = (report: SecurityReport, order: PentestOrder): string => {
  let pdfContent = `**********************************************
    SECURITY ASSESSMENT REPORT
    Projekt Ckryptbit
**********************************************

Service: ${order.productName}
Order ID: ${order.id}
Target: ${report.targetSummary.targetUrl || report.targetSummary.targetIp || 'N/A'}
${report.targetSummary.scopeNotes ? `Scope Notes: ${report.targetSummary.scopeNotes}\n` : ''}
Report Generated: ${new Date(report.generatedDate).toLocaleString()}
Overall Risk (Simulated): ${report.overallRiskScore !== undefined ? report.overallRiskScore + '/10' : 'N/A'}

----------------------------------------------
EXECUTIVE SUMMARY
----------------------------------------------
${report.executiveSummary}

----------------------------------------------
FINDINGS (${report.findings.length})
----------------------------------------------\n\n`;

  if (report.findings.length > 0) {
    report.findings.forEach(finding => {
      pdfContent += `${formatFindingForPdf(finding)}\n--------------------\n\n`;
    });
  } else {
    pdfContent += "No significant vulnerabilities identified in this simulated scan.\n\n--------------------\n\n";
  }

  if (report.adaptiveDefenseSimulation && report.adaptiveDefenseSimulation.length > 0) {
    pdfContent += `----------------------------------------------
KI ADAPTIVE DEFENSE SIMULATION LOGS
----------------------------------------------\n`;
    report.adaptiveDefenseSimulation.forEach(log => {
        pdfContent += `Action: ${log.action}\n`;
        pdfContent += `Detail: ${log.detail}\n`;
        pdfContent += `Simulated Effect: ${log.simulatedEffect}\n`;
        pdfContent += `Confidence: ${log.confidence}\n\n`;
    });
    pdfContent += `--------------------\n\n`;
  }
  
  if (report.simulatedDefenseBypassAttempts && report.simulatedDefenseBypassAttempts.length > 0) {
    pdfContent += `----------------------------------------------
SIMULATED DEFENSE BYPASS ATTEMPTS
----------------------------------------------\n`;
    report.simulatedDefenseBypassAttempts.forEach(attempt => {
        pdfContent += `Technique: ${attempt.technique}\n`;
        pdfContent += `Targeted Defense Action: ${attempt.targetDefenseAction}\n`;
        pdfContent += `Outcome: ${attempt.outcome}\n`;
        pdfContent += `Detail: ${attempt.detail}\n\n`;
    });
    pdfContent += `--------------------\n\n`;
  }


  if (report.methodology) {
    pdfContent += `----------------------------------------------
METHODOLOGY NOTES
----------------------------------------------
${report.methodology}\n\n`;
  }

  pdfContent += `**********************************************
    END OF REPORT
    This is a simulated report for demonstration purposes.
**********************************************`;

  return pdfContent;
};

export const downloadReportAsPdf = (report: SecurityReport, order: PentestOrder): void => {
  const reportContent = generateMockPdfContent(report, order);
  const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
  
  const targetName = (report.targetSummary.targetUrl || report.targetSummary.targetIp || 'UnknownTarget').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Security_Report_ProjektCkryptbit_${order.id.substring(0, 8)}_${targetName}.txt`; // Changed to .txt

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  alert(`Simulated TXT report download initiated: ${fileName}`);
};
