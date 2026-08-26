import { Reporter, TestCase, TestResult } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

interface EnhancedStepItem {
  title: string;
  duration: number;
  status: string;
  error?: string;
  screenshot?: string;
}

interface TestReportItem {
  name: string;
  status: string;
  duration: number;
  error?: string;
  steps: EnhancedStepItem[];
}

class CustomShareableReporter implements Reporter {
  private reportData: TestReportItem[] = [];
  private reportDir: string = path.join(process.cwd(), 'custom-shareable-report');

  onTestEnd(test: TestCase, result: TestResult) {
    const assetsDir = path.join(this.reportDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    const stepScreenshots = new Map<string, string>();
    result.attachments.forEach((attachment, index) => {
      if (attachment.name === 'screenshot' && attachment.path && fs.existsSync(attachment.path)) {
        const safeTitle = test.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeTitle}_snap_${index}.png`;
        const targetPath = path.join(assetsDir, fileName);
        
        fs.copyFileSync(attachment.path, targetPath);
        stepScreenshots.set(attachment.path, `assets/${fileName}`);
      }
    });

    const formattedSteps: EnhancedStepItem[] = [];

    const parseSteps = (steps: Array<any>) => {
      for (const step of steps) {
        if (step.category === 'hook') continue;

        let associatedScreenshot: string | undefined;
        
        result.attachments.forEach(attachment => {
          if (attachment.name === 'screenshot' && attachment.path) {
            associatedScreenshot = stepScreenshots.get(attachment.path);
          }
        });

        formattedSteps.push({
          title: step.title,
          duration: step.duration,
          status: step.error ? 'failed' : 'passed',
          error: step.error?.message,
          screenshot: associatedScreenshot
        });

        if (step.steps && step.steps.length > 0) {
          parseSteps(step.steps);
        }
      }
    };

    parseSteps(result.steps);

    this.reportData.push({
      name: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
      steps: formattedSteps,
    });
  }

  // CHANGED: Removed FullResult typing completely to bypass the version compilation error
  async onEnd(result: any) {
    if (!fs.existsSync(this.reportDir)) {
      fs.mkdirSync(this.reportDir, { recursive: true });
    }

    const overallStatus = result?.status ? String(result.status).toUpperCase() : 'UNKNOWN';

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Playwright Visual Execution Report</title>
    <style>
        body { font-family: 'Segoe UI', system-ui, sans-serif; margin: 40px; background-color: #f8fafc; color: #1e293b; }
        h1 { color: #0f172a; margin-bottom: 5px; }
        .summary-card { padding: 15px 20px; border-radius: 8px; font-weight: 600; display: inline-block; margin-bottom: 30px; }
        .summary-card.passed { background-color: #dcfce7; color: #15803d; }
        .summary-card.failed { background-color: #fee2e2; color: #b91c1c; }
        
        .test-card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); overflow: hidden; }
        .test-header { padding: 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; background: #fdfdfd; }
        .test-title { font-size: 1.2em; font-weight: 600; color: #334155; }
        
        .badge { padding: 6px 12px; border-radius: 20px; font-size: 0.85em; font-weight: 700; text-transform: uppercase; }
        .badge.passed { background-color: #4ade80; color: #047857; }
        .badge.failed { background-color: #f87171; color: #b91c1c; }
        
        .steps-container { padding: 20px; background-color: #fafafa; }
        .step-item { border-left: 3px solid #cbd5e1; margin-left: 10px; padding-left: 20px; padding-bottom: 20px; position: relative; }
        .step-item::before { content: ''; position: absolute; left: -7px; top: 4px; width: 11px; height: 11px; border-radius: 50%; background: #cbd5e1; }
        .step-item.failed { border-left-color: #ef4444; }
        .step-item.failed::before { background: #ef4444; }
        
        .step-header-info { display: flex; justify-content: space-between; width: 100%; font-size: 0.95em; }
        .step-title-text { font-weight: 500; color: #475569; }
        .step-duration { color: #94a3b8; font-size: 0.85em; }
        
        .step-error { background: #fff1f2; border: 1px solid #fecdd3; color: #9f1239; padding: 10px; border-radius: 6px; font-family: monospace; font-size: 0.85em; margin-top: 8px; white-space: pre-wrap; }
        
        .img-wrapper { margin-top: 12px; }
        .step-img { max-width: 450px; border: 2px solid #e2e8f0; border-radius: 6px; transition: transform 0.2s, box-shadow 0.2s; cursor: zoom-in; }
        .step-img:hover { transform: translateY(-2px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <h1>VCentral Playwright Execution Report</h1>
    <div class="summary-card ${String(result?.status || 'failed').toLowerCase()}">Overall Suite Run Status: ${overallStatus}</div>

    <div>
        ${this.reportData.map(testCase => `
            <div class="test-card">
                <div class="test-header">
                    <div class="test-title">${testCase.name}</div>
                    <div>
                        <span style="margin-right: 15px; color: #64748b; font-size:0.9em;">${testCase.duration.toLocaleString()} ms</span>
                        <span class="badge ${testCase.status}">${testCase.status}</span>
                    </div>
                </div>
                
                <div class="steps-container">
                    ${testCase.error ? `<div class="step-error" style="margin-bottom:20px; font-size:0.95em;"><strong>Global Error:</strong>\n${testCase.error}</div>` : ''}
                    
                    <h4 style="margin-top:0; color:#64748b;">Execution Timeline Steps</h4>
                    ${testCase.steps.map(step => `
                        <div class="step-item ${step.status}">
                            <div class="step-header-info">
                                <span class="step-title-text">${step.title}</span>
                                <span class="step-duration">${step.duration} ms</span>
                            </div>
                            ${step.error ? `<div class="step-error">${step.error}</div>` : ''}
                            ${step.screenshot ? `
                                <div class="img-wrapper">
                                    <a href="${step.screenshot}" target="_blank">
                                        <img class="step-img" src="${step.screenshot}" alt="Step capture" />
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>`;

    const reportPath = path.join(this.reportDir, 'index.html');
    fs.writeFileSync(reportPath, htmlContent, 'utf8');
    console.log(`\n🚀 VCentral Project Creation steps report generated at: ${reportPath}`);
  }
}

export default CustomShareableReporter;
