import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import * as pdfParse from 'pdf-parse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface TaxBracket {
  min: number;
  max: number | null; // null means no upper limit
  rate: number;
}

const NATIONAL_TAX_URL = 'https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tuloveroasteikko/';
const OUTPUT_FILE = path.join(__dirname, '../data/national-brackets.json');

/**
 * Scrapes national income tax brackets from Vero.fi
 * 
 * This may be in HTML table format or PDF format.
 * We'll try both approaches and fall back gracefully.
 */
async function scrapeNationalBrackets(): Promise<TaxBracket[]> {
  console.log('🏛️ Scraping national income tax brackets from Vero.fi...');
  
  try {
    // First, try to find HTML table data
    const htmlBrackets = await scrapeFromHTML();
    if (htmlBrackets.length > 0) {
      console.log(`📊 Found ${htmlBrackets.length} tax brackets in HTML format`);
      return htmlBrackets;
    }
    
    // If no HTML table, try to find and parse PDF
    console.log('📄 No HTML table found, searching for PDF...');
    const pdfBrackets = await scrapeFromPDF();
    if (pdfBrackets.length > 0) {
      console.log(`📊 Found ${pdfBrackets.length} tax brackets in PDF format`);
      return pdfBrackets;
    }
    
    throw new Error('No tax bracket data found in HTML or PDF format');
    
  } catch (error) {
    console.error('❌ Error scraping national brackets:', error);
    
    // Try to load fallback data
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('📁 Loading fallback data from previous scrape...');
      const fallbackData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`📋 Using fallback data with ${fallbackData.length} brackets`);
      return fallbackData;
    }
    
    throw error;
  }
}

/**
 * Attempts to scrape tax brackets from HTML table
 */
async function scrapeFromHTML(): Promise<TaxBracket[]> {
  const response = await axios.get(NATIONAL_TAX_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    timeout: 30000
  });

  const $ = cheerio.load(response.data);
  const brackets: TaxBracket[] = [];

  // Look for tables containing tax bracket data
  const tableSelectors = [
    'table',
    '.table',
    '[class*="table"]',
    '[class*="asteikko"]',
    '[class*="verokanta"]'
  ];

  for (const selector of tableSelectors) {
    const tables = $(selector);
    
    tables.each((_, table) => {
      const rows = $(table).find('tr');
      
      if (rows.length > 2) { // Likely a data table
        console.log(`📊 Found potential tax bracket table with ${rows.length} rows`);
        
        rows.each((_, row) => {
          const cells = $(row).find('td, th');
          
          if (cells.length >= 3) {
            const minCell = $(cells[0]).text().trim();
            const maxCell = $(cells[1]).text().trim();
            const rateCell = $(cells[2]).text().trim();
            
            // Skip header rows
            if (minCell.toLowerCase().includes('tulo') || 
                minCell.toLowerCase().includes('income') ||
                rateCell.toLowerCase().includes('%') ||
                rateCell.toLowerCase().includes('prosentti')) {
              return;
            }
            
            const bracket = parseTaxBracket(minCell, maxCell, rateCell);
            if (bracket) {
              brackets.push(bracket);
              console.log(`✅ Bracket: €${bracket.min.toLocaleString()} - ${bracket.max ? '€' + bracket.max.toLocaleString() : '∞'}: ${(bracket.rate * 100).toFixed(1)}%`);
            }
          }
        });
      }
    });
    
    if (brackets.length > 0) break;
  }

  return brackets;
}

/**
 * Attempts to scrape tax brackets from PDF documents
 */
async function scrapeFromPDF(): Promise<TaxBracket[]> {
  const response = await axios.get(NATIONAL_TAX_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    },
    timeout: 30000
  });

  const $ = cheerio.load(response.data);
  const brackets: TaxBracket[] = [];

  // Look for PDF links
  const pdfLinks = $('a[href$=".pdf"], a[href*="pdf"]');
  
  pdfLinks.each(async (_, link) => {
    const href = $(link).attr('href');
    const text = $(link).text().toLowerCase();
    
    // Look for tax bracket related PDFs
    if (href && (text.includes('asteikko') || text.includes('verokanta') || text.includes('tulovero'))) {
      try {
        console.log(`📄 Found potential PDF: ${href}`);
        const pdfBrackets = await parsePDFBrackets(href);
        brackets.push(...pdfBrackets);
      } catch (error) {
        console.log(`⚠️ Failed to parse PDF ${href}:`, error.message);
      }
    }
  });

  return brackets;
}

/**
 * Parses tax brackets from a PDF document
 */
async function parsePDFBrackets(pdfUrl: string): Promise<TaxBracket[]> {
  const response = await axios.get(pdfUrl, {
    responseType: 'arraybuffer',
    timeout: 30000
  });

  const pdfBuffer = Buffer.from(response.data);
  const pdfData = await pdfParse(pdfBuffer);
  const text = pdfData.text;
  
  console.log(`📄 PDF text length: ${text.length} characters`);
  
  const brackets: TaxBracket[] = [];
  
  // Look for tax bracket patterns in PDF text
  // Pattern: income range followed by percentage
  const bracketPatterns = [
    // Finnish patterns
    /(\d+(?:\s?\d{3})*)\s*-\s*(\d+(?:\s?\d{3})*)\s*euroa?\s*(\d+(?:[,.]\d+)?)\s*%/gi,
    /(\d+(?:\s?\d{3})*)\s*-\s*(\d+(?:\s?\d{3})*)\s*€\s*(\d+(?:[,.]\d+)?)\s*%/gi,
    // Patterns with "yli" (over)
    /yli\s*(\d+(?:\s?\d{3})*)\s*euroa?\s*(\d+(?:[,.]\d+)?)\s*%/gi,
    /yli\s*(\d+(?:\s?\d{3})*)\s*€\s*(\d+(?:[,.]\d+)?)\s*%/gi,
  ];
  
  for (const pattern of bracketPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const bracket = parseTaxBracket(match[1], match[2], match[3]);
      if (bracket) {
        brackets.push(bracket);
        console.log(`✅ PDF Bracket: €${bracket.min.toLocaleString()} - ${bracket.max ? '€' + bracket.max.toLocaleString() : '∞'}: ${(bracket.rate * 100).toFixed(1)}%`);
      }
    }
  }
  
  return brackets;
}

/**
 * Parses individual tax bracket from text values
 */
function parseTaxBracket(minText: string, maxText: string, rateText: string): TaxBracket | null {
  try {
    const min = parseAmount(minText);
    const max = maxText && maxText.toLowerCase() !== 'yli' ? parseAmount(maxText) : null;
    const rate = parseRate(rateText);
    
    if (min !== null && rate !== null) {
      return { min, max, rate };
    }
  } catch (error) {
    console.log(`⚠️ Failed to parse bracket: ${minText} - ${maxText} = ${rateText}%`);
  }
  
  return null;
}

/**
 * Parses amount from text (removes spaces, handles Finnish number format)
 */
function parseAmount(amountText: string): number | null {
  const cleaned = amountText.replace(/[^\d]/g, '');
  const amount = parseInt(cleaned);
  return isNaN(amount) ? null : amount;
}

/**
 * Parses tax rate from text and converts to decimal
 */
function parseRate(rateText: string): number | null {
  const cleaned = rateText.replace(/[^\d,.-]/g, '').replace(',', '.');
  const rate = parseFloat(cleaned);
  
  if (isNaN(rate)) return null;
  
  // Convert percentage to decimal if needed
  if (rate > 1) {
    return rate / 100;
  }
  
  return rate;
}

/**
 * Saves scraped data to JSON file
 */
function saveNationalBrackets(data: TaxBracket[]): void {
  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Sort brackets by minimum amount
  const sortedData = data.sort((a, b) => a.min - b.min);
  
  // Save with pretty formatting
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(sortedData, null, 2), 'utf8');
  console.log(`💾 Saved national brackets to ${OUTPUT_FILE}`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    const nationalBrackets = await scrapeNationalBrackets();
    saveNationalBrackets(nationalBrackets);
    
    console.log('✅ National brackets scraping completed successfully!');
    console.log(`📊 Total brackets: ${nationalBrackets.length}`);
    
    // Show sample of scraped data
    console.log('📋 Tax brackets:');
    nationalBrackets.forEach((bracket, index) => {
      const maxText = bracket.max ? `€${bracket.max.toLocaleString()}` : '∞';
      console.log(`   ${index + 1}. €${bracket.min.toLocaleString()} - ${maxText}: ${(bracket.rate * 100).toFixed(1)}%`);
    });
    
  } catch (error) {
    console.error('💥 Failed to scrape national brackets:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scrapeNationalBrackets, parseTaxBracket, parseAmount, parseRate };
