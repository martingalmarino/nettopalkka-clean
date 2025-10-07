import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MunicipalRate {
  [key: string]: number;
}

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

interface PensionRates {
  TyEL: number;
  YEL: number;
  healthInsurance: number;
  unemploymentInsurance?: number;
  lastUpdated?: string;
}

interface ConsolidatedTaxData {
  nationalBrackets: TaxBracket[];
  municipalRates: MunicipalRate;
  contributions: {
    TyEL: number;
    YEL: number;
    healthInsurance: number;
    unemploymentInsurance: number;
  };
  metadata: {
    lastUpdated: string;
    dataSources: string[];
    version: string;
  };
}

const DATA_DIR = path.join(__dirname, '../data');
const OUTPUT_FILE = path.join(__dirname, '../../lib/taxDataFI.ts');

/**
 * Consolidates all scraped tax data into a single TypeScript file
 * 
 * This script reads the individual JSON files from the scraping process
 * and creates a consolidated taxDataFI.ts file that the calculator can use.
 */
async function buildTaxDataFI(): Promise<void> {
  console.log('🔧 Building consolidated tax data file...');
  
  try {
    // Read all scraped data files
    const municipalRates = await readMunicipalRates();
    const nationalBrackets = await readNationalBrackets();
    const pensionRates = await readPensionRates();
    
    // Create consolidated data structure
    const consolidatedData: ConsolidatedTaxData = {
      nationalBrackets,
      municipalRates,
      contributions: {
        TyEL: pensionRates.TyEL,
        YEL: pensionRates.YEL,
        healthInsurance: pensionRates.healthInsurance,
        unemploymentInsurance: pensionRates.unemploymentInsurance || 0.0125 // Default fallback
      },
      metadata: {
        lastUpdated: new Date().toISOString(),
        dataSources: [
          'https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/kunnallisvero/',
          'https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tuloveroasteikko/',
          'https://www.tyoelake.fi/'
        ],
        version: '1.0.0'
      }
    };
    
    // Generate TypeScript file content
    const tsContent = generateTypeScriptFile(consolidatedData);
    
    // Write the consolidated file
    fs.writeFileSync(OUTPUT_FILE, tsContent, 'utf8');
    
    console.log('✅ Consolidated tax data file created successfully!');
    console.log(`📊 Municipal rates: ${Object.keys(municipalRates).length} municipalities`);
    console.log(`📊 National brackets: ${nationalBrackets.length} brackets`);
    console.log(`📊 Contributions: TyEL ${(pensionRates.TyEL * 100).toFixed(2)}%, YEL ${(pensionRates.YEL * 100).toFixed(2)}%, Health ${(pensionRates.healthInsurance * 100).toFixed(2)}%`);
    console.log(`📅 Last updated: ${consolidatedData.metadata.lastUpdated}`);
    console.log(`💾 Output file: ${OUTPUT_FILE}`);
    
  } catch (error) {
    console.error('💥 Failed to build consolidated tax data:', error);
    process.exit(1);
  }
}

/**
 * Reads municipal tax rates from JSON file
 */
async function readMunicipalRates(): Promise<MunicipalRate> {
  const filePath = path.join(DATA_DIR, 'municipal-rates.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Municipal rates file not found: ${filePath}`);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📁 Read municipal rates: ${Object.keys(data).length} municipalities`);
  
  return data;
}

/**
 * Reads national tax brackets from JSON file
 */
async function readNationalBrackets(): Promise<TaxBracket[]> {
  const filePath = path.join(DATA_DIR, 'national-brackets.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`National brackets file not found: ${filePath}`);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📁 Read national brackets: ${data.length} brackets`);
  
  return data;
}

/**
 * Reads pension and social contribution rates from JSON file
 */
async function readPensionRates(): Promise<PensionRates> {
  const filePath = path.join(DATA_DIR, 'pension-rates.json');
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Pension rates file not found: ${filePath}`);
  }
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log(`📁 Read pension rates: TyEL ${(data.TyEL * 100).toFixed(2)}%, YEL ${(data.YEL * 100).toFixed(2)}%`);
  
  return data;
}

/**
 * Generates TypeScript file content from consolidated data
 */
function generateTypeScriptFile(data: ConsolidatedTaxData): string {
  const timestamp = new Date().toLocaleString('fi-FI', {
    timeZone: 'Europe/Helsinki',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `// Auto-generated tax data for Finland
// Generated on: ${timestamp}
// Data sources: ${data.metadata.dataSources.join(', ')}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
}

export interface MunicipalRate {
  [key: string]: number;
}

export interface PensionRates {
  TyEL: number;
  YEL: number;
  healthInsurance: number;
  unemploymentInsurance: number;
}

export interface TaxDataFI {
  nationalBrackets: TaxBracket[];
  municipalRates: MunicipalRate;
  contributions: PensionRates;
  metadata: {
    lastUpdated: string;
    dataSources: string[];
    version: string;
  };
}

export const taxDataFI: TaxDataFI = ${JSON.stringify(data, null, 2)};

// Helper function to get municipal rate by name
export function getMunicipalRate(municipality: string): number {
  const normalizedName = municipality.toLowerCase().replace(/[äöå]/g, (char) => {
    const map: { [key: string]: string } = { 'ä': 'a', 'ö': 'o', 'å': 'a' };
    return map[char] || char;
  }).replace(/[^a-z0-9]/g, '');
  
  return taxDataFI.municipalRates[normalizedName] || taxDataFI.municipalRates['helsinki'] || 0.175;
}

// Helper function to get tax bracket for income
export function getTaxBracket(income: number): TaxBracket | null {
  return taxDataFI.nationalBrackets.find(bracket => 
    income >= bracket.min && (bracket.max === null || income <= bracket.max)
  ) || null;
}

// Helper function to calculate national tax
export function calculateNationalTax(income: number): number {
  let totalTax = 0;
  
  for (const bracket of taxDataFI.nationalBrackets) {
    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, bracket.max || income) - bracket.min;
      totalTax += taxableInBracket * bracket.rate;
    }
  }
  
  return totalTax;
}

// Helper function to get contribution rates
export function getContributionRates(): PensionRates {
  return taxDataFI.contributions;
}
`;
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    await buildTaxDataFI();
    console.log('🎉 Tax data consolidation completed successfully!');
  } catch (error) {
    console.error('💥 Failed to consolidate tax data:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { buildTaxDataFI, readMunicipalRates, readNationalBrackets, readPensionRates };
