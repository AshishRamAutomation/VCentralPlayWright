import { Reporter, TestCase, TestResult, FullResult, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

class CustomShareableReporter implements Reporter {
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
    const reportDir = path.join(process.cwd(), 'custom-shareable-report');
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir);
    }

    // Generate self-contained HTML with styling included
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Playwright Test Run Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 30px; background-color: #f4f7f6; }
        h1 { color: #333; }
        .summary { margin-bottom: 20px; font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; background: #fff; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #4CAF50; color: white; }
        .passed { color: green; font-weight: bold; }
        .failed { color: red; font-weight: bold; }
        .error-msg { font-size: 0.9em; color: #555; background: #fee; padding: 5px; border-left: 3px solid #f44336; margin-top: 5px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <h1>Playwright Test Execution Report</h1>
    <div class="summary">Overall Status: ${result.status.toUpperCase()}</div>
    <table>
        <thead>
            <tr>
                <th>Test Case</th>
                <th>Status</th>
                <th>Duration (ms)</th>
            </tr>
        </thead>
        <tbody>
            ${this.reportData.map(t => `
                <tr>
                    <td>${t.name}</td>
                    <td class="${t.status}">${t.status.toUpperCase()}</td>
                    <td>${t.duration}</td>
                </tr>
                ${t.error ? `<tr><td colspan="3"><div class="error-msg">${t.error}</div></td></tr>` : ''}
            `).join('')}
        </tbody>
    </table>
</body>
</html>`;

    const reportPath = path.join(reportDir, 'index.html');
    fs.writeFileSync(reportPath, htmlContent, 'utf8');
    console.log(`\n🚀 Custom shareable report generated at: ${reportPath}`);
  }
}

export default CustomShareableReporter;
