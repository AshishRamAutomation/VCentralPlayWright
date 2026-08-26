import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import * as fs from 'fs';
import * as path from 'path';

class VcentralCreateProjectReporter implements Reporter {
  private reportData: Array<{ name: string; status: string; duration: number; error?: string }> = [];

  // Called when a single test finishes
  onTestEnd(test: TestCase, result: TestResult) {
    this.reportData.push({
      name: test.title,
      status: result.status,
      duration: result.duration,
      error: result.error?.message,
    });
  }

  // Called after all tests have completed
  async onEnd(result: FullResult) {
    // Updated output directory to match Vcentral project creation context
    const reportDir = path.join(process.cwd(), 'create-project-report');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Capture environmental data and time
    const buildTimestamp = new Date().toLocaleString();
    const testEnvironment = process.env.NODE_ENV || 'Local / Dev';

    // Calculate pass/fail metrics
    const totalSteps = this.reportData.length;
    const passedSteps = this.reportData.filter(t => t.status === 'passed').length;
    const failedSteps = this.reportData.filter(t => t.status === 'failed' || t.status === 'timedOut').length;

    // Process test cases to extract step names or format titles cleanly
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>VCentral Playwright Reports</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; background-color: #f8f9fa; color: #333; }
        h1 { color: #1a202c; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; }
        .meta-container { margin-bottom: 20px; font-size: 0.95rem; color: #718096; line-height: 1.6; }
        .meta-item strong { color: #4a5568; }
        
        /* Stats Dashboard Styling */
        .stats-dashboard { display: flex; gap: 15px; margin-bottom: 25px; }
        .stat-card { padding: 12px 20px; border-radius: 6px; font-weight: bold; min-width: 120px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .stat-card.total { background-color: #e2e8f0; color: #4a5568; }
        .stat-card.passed { background-color: #c6f6d5; color: #22543d; }
        .stat-card.failed { background-color: #fed7d7; color: #742a2a; }
        .stat-card .num { font-size: 1.5rem; display: block; margin-top: 4px; }
        
        .summary-banner { display: inline-block; padding: 8px 16px; border-radius: 6px; font-weight: bold; font-size: 1.1rem; margin-bottom: 25px; width: calc(100% - 32px); }
        .summary-banner.passed { background-color: #c6f6d5; color: #22543d; border-left: 5px solid #38a169; }
        .summary-banner.failed { background-color: #fed7d7; color: #742a2a; border-left: 5px solid #e53e3e; }
        
        table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        th, td { padding: 14px 18px; text-align: left; border-bottom: 1px solid #edf2f7; }
        th { background-color: #2d3748; color: white; font-weight: 600; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
        tr:last-child td { border-bottom: none; }
        .step-badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; font-size: 0.8rem; font-weight: bold; margin-right: 10px; background-color: #cbd5e0; color: #4a5568; }
        .step-container { display: flex; align-items: center; }
        .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; }
        .status-badge.passed { background-color: #e6fffa; color: #234e52; }
        .status-badge.failed { background-color: #fff5f5; color: #9b2c2c; }
        .error-msg { font-size: 0.85em; color: #c53030; background: #fff5f5; padding: 12px; border-left: 4px solid #e53e3e; margin: 10px 18px; border-radius: 4px; white-space: pre-wrap; font-family: SFMono-Regular, Consolas, Monaco, monospace; }
    </style>
</head>
<body>
    <h1>VCentral Playwright Reports</h1>
    
    <div class="meta-container">
        <div class="meta-item"><strong>Workflow:</strong> VCentral Automated Test Suite</div>
        <div class="meta-item"><strong>Environment:</strong> ${testEnvironment}</div>
        <div class="meta-item"><strong>Execution Time:</strong> ${buildTimestamp}</div>
    </div>

    <div class="stats-dashboard">
        <div class="stat-card total">Total Steps <span class="num">${totalSteps}</span></div>
        <div class="stat-card passed">Passed <span class="num">${passedSteps}</span></div>
        <div class="stat-card failed">Failed <span class="num">${failedSteps}</span></div>
    </div>
    
    <div class="summary-banner ${result.status}">${result.status === 'passed' ? '✅ ALL STEPS PASSED' : '❌ WORKFLOW FAILED'}</div>
    
    <table>
        <thead>
            <tr>
                <th>Execution Step</th>
                <th>Status</th>
                <th>Duration</th>
            </tr>
        </thead>
        <tbody>
            ${this.reportData.map((t, idx) => `
                <tr>
                    <td>
                        <div class="step-container">
                            <span class="step-badge">${idx + 1}</span>
                            <span>${t.name}</span>
                        </div>
                    </td>
                    <td><span class="status-badge ${t.status}">${t.status}</span></td>
                    <td>${(t.duration / 1000).toFixed(2)}s</td>
                </tr>
                ${t.error ? `<tr><td colspan="3"><div class="error-msg">${t.error}</div></td></tr>` : ''}
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

    const reportPath = path.join(reportDir, 'index.html');
    fs.writeFileSync(reportPath, htmlContent, 'utf8');
    console.log(`\n🚀 VCentral Project Creations step-report generated at: ${reportPath}`);
  }
}

export default VcentralCreateProjectReporter;
