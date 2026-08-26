import * as XLSX from 'xlsx';

// Node.js type definitions are not available in the current TypeScript configuration.
// @ts-ignore
import * as path from 'path';

declare const __dirname: string;

export class ExcelReader {
  /**
   * Reads data from a specified Excel sheet based on a unique TestCase row ID identifier.
   */
  static getRowData(fileName: string, sheetName: string, testCaseId: string) {
    // Correctly targets projectData.xlsx inside the 'src/data/' folder
    const filePath = path.resolve(__dirname, `../data/${fileName}`);
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[sheetName];
    
    // Parse sheet columns into JSON records
    const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
    const row = jsonData.find(data => data.TestCase === testCaseId);
    
    if (!row) {
      throw new Error(`Test Case ID '${testCaseId}' was not located within spreadsheet sheet '${sheetName}'.`);
    }
    return row;
  }
}
