import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PensionRates {
  TyEL: number;
  YEL: number;
  healthInsurance: number;
  unemploymentInsurance?: number;
  lastUpdated?: string;
}

const PENSION_URL = 'https://www.tyoelake.fi/';
const OUTPUT_FILE = path.join(__dirname, '../data/pension-rates.json');

/**
 * Scrapes pension and social contribution rates from Työeläke.fi
 * 
 * This includes:
 * - TyEL (Employee pension insurance)
 * - YEL (Self-employed pension insurance)
 * - Health insurance contributions
 * - Unemployment insurance contributions
 */
async function scrapePensionRates(): Promise<PensionRates> {
  console.log('🏛️ Scraping pension and social contribution rates from Työeläke.fi...');
  
  try {
    // Fetch the main page
    const response = await axios.get(PENSION_URL, {
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
    const rates: Partial<PensionRates> = {};

    // Look for rate information in various formats
    await scrapeTyELRates($, rates);
    await scrapeYELRates($, rates);
    await scrapeHealthInsuranceRates($, rates);
    await scrapeUnemploymentInsuranceRates($, rates);

    // Validate required rates
    if (!rates.TyEL || !rates.YEL || !rates.healthInsurance) {
      throw new Error('Missing required pension rates');
    }

    const pensionRates: PensionRates = {
      TyEL: rates.TyEL!,
      YEL: rates.YEL!,
      healthInsurance: rates.healthInsurance!,
      unemploymentInsurance: rates.unemploymentInsurance,
      lastUpdated: new Date().toISOString()
    };

    console.log('📊 Successfully scraped pension and social contribution rates:');
    console.log(`   TyEL: ${(pensionRates.TyEL * 100).toFixed(2)}%`);
    console.log(`   YEL: ${(pensionRates.YEL * 100).toFixed(2)}%`);
    console.log(`   Health Insurance: ${(pensionRates.healthInsurance * 100).toFixed(2)}%`);
    if (pensionRates.unemploymentInsurance) {
      console.log(`   Unemployment Insurance: ${(pensionRates.unemploymentInsurance * 100).toFixed(2)}%`);
    }

    return pensionRates;

  } catch (error) {
    console.error('❌ Error scraping pension rates:', error);
    
    // Try to load fallback data
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('📁 Loading fallback data from previous scrape...');
      const fallbackData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`📋 Using fallback data from ${fallbackData.lastUpdated || 'unknown date'}`);
      return fallbackData;
    }
    
    throw error;
  }
}

/**
 * Scrapes TyEL (Employee pension insurance) rates
 */
async function scrapeTyELRates($: cheerio.CheerioAPI, rates: Partial<PensionRates>): Promise<void> {
  console.log('🔍 Looking for TyEL rates...');
  
  // Look for TyEL rate information
  const tyelSelectors = [
    '[class*="tyel"]',
    '[class*="työeläke"]',
    '[class*="employee"]',
    '[class*="pension"]'
  ];

  for (const selector of tyelSelectors) {
    const elements = $(selector);
    
    elements.each((_, element) => {
      const text = $(element).text();
      
      // Look for percentage patterns
      const rateMatch = text.match(/(\d+(?:[,.]\d+)?)\s*%/);
      if (rateMatch && text.toLowerCase().includes('tyel')) {
        const rate = parseFloat(rateMatch[1].replace(',', '.')) / 100;
        if (rate > 0 && rate < 1) { // Reasonable range
          rates.TyEL = rate;
          console.log(`✅ Found TyEL rate: ${(rate * 100).toFixed(2)}%`);
        }
      }
    });
  }

  // Fallback: Look for TyEL in table format
  if (!rates.TyEL) {
    const tables = $('table');
    
    tables.each((_, table) => {
      const rows = $(table).find('tr');
      
      rows.each((_, row) => {
        const cells = $(row).find('td, th');
        
        if (cells.length >= 2) {
          const labelCell = $(cells[0]).text().toLowerCase();
          const rateCell = $(cells[1]).text();
          
          if (labelCell.includes('tyel') || labelCell.includes('työeläke')) {
            const rate = parseRate(rateCell);
            if (rate !== null) {
              rates.TyEL = rate;
              console.log(`✅ Found TyEL rate in table: ${(rate * 100).toFixed(2)}%`);
            }
          }
        }
      });
    });
  }
}

/**
 * Scrapes YEL (Self-employed pension insurance) rates
 */
async function scrapeYELRates($: cheerio.CheerioAPI, rates: Partial<PensionRates>): Promise<void> {
  console.log('🔍 Looking for YEL rates...');
  
  // Look for YEL rate information
  const yelSelectors = [
    '[class*="yel"]',
    '[class*="yrittäjä"]',
    '[class*="self-employed"]',
    '[class*="entrepreneur"]'
  ];

  for (const selector of yelSelectors) {
    const elements = $(selector);
    
    elements.each((_, element) => {
      const text = $(element).text();
      
      // Look for percentage patterns
      const rateMatch = text.match(/(\d+(?:[,.]\d+)?)\s*%/);
      if (rateMatch && text.toLowerCase().includes('yel')) {
        const rate = parseFloat(rateMatch[1].replace(',', '.')) / 100;
        if (rate > 0 && rate < 1) { // Reasonable range
          rates.YEL = rate;
          console.log(`✅ Found YEL rate: ${(rate * 100).toFixed(2)}%`);
        }
      }
    });
  }

  // Fallback: Look for YEL in table format
  if (!rates.YEL) {
    const tables = $('table');
    
    tables.each((_, table) => {
      const rows = $(table).find('tr');
      
      rows.each((_, row) => {
        const cells = $(row).find('td, th');
        
        if (cells.length >= 2) {
          const labelCell = $(cells[0]).text().toLowerCase();
          const rateCell = $(cells[1]).text();
          
          if (labelCell.includes('yel') || labelCell.includes('yrittäjä')) {
            const rate = parseRate(rateCell);
            if (rate !== null) {
              rates.YEL = rate;
              console.log(`✅ Found YEL rate in table: ${(rate * 100).toFixed(2)}%`);
            }
          }
        }
      });
    });
  }
}

/**
 * Scrapes health insurance contribution rates
 */
async function scrapeHealthInsuranceRates($: cheerio.CheerioAPI, rates: Partial<PensionRates>): Promise<void> {
  console.log('🔍 Looking for health insurance rates...');
  
  // Look for health insurance rate information
  const healthSelectors = [
    '[class*="terveys"]',
    '[class*="health"]',
    '[class*="sairaus"]',
    '[class*="medical"]'
  ];

  for (const selector of healthSelectors) {
    const elements = $(selector);
    
    elements.each((_, element) => {
      const text = $(element).text();
      
      // Look for percentage patterns
      const rateMatch = text.match(/(\d+(?:[,.]\d+)?)\s*%/);
      if (rateMatch && (text.toLowerCase().includes('terveys') || text.toLowerCase().includes('sairaus'))) {
        const rate = parseFloat(rateMatch[1].replace(',', '.')) / 100;
        if (rate > 0 && rate < 0.1) { // Health insurance is typically 1-2%
          rates.healthInsurance = rate;
          console.log(`✅ Found health insurance rate: ${(rate * 100).toFixed(2)}%`);
        }
      }
    });
  }

  // Fallback: Look for health insurance in table format
  if (!rates.healthInsurance) {
    const tables = $('table');
    
    tables.each((_, table) => {
      const rows = $(table).find('tr');
      
      rows.each((_, row) => {
        const cells = $(row).find('td, th');
        
        if (cells.length >= 2) {
          const labelCell = $(cells[0]).text().toLowerCase();
          const rateCell = $(cells[1]).text();
          
          if (labelCell.includes('terveys') || labelCell.includes('sairaus')) {
            const rate = parseRate(rateCell);
            if (rate !== null) {
              rates.healthInsurance = rate;
              console.log(`✅ Found health insurance rate in table: ${(rate * 100).toFixed(2)}%`);
            }
          }
        }
      });
    });
  }
}

/**
 * Scrapes unemployment insurance contribution rates
 */
async function scrapeUnemploymentInsuranceRates($: cheerio.CheerioAPI, rates: Partial<PensionRates>): Promise<void> {
  console.log('🔍 Looking for unemployment insurance rates...');
  
  // Look for unemployment insurance rate information
  const unemploymentSelectors = [
    '[class*="työttömyys"]',
    '[class*="unemployment"]',
    '[class*="työttömyysturva"]'
  ];

  for (const selector of unemploymentSelectors) {
    const elements = $(selector);
    
    elements.each((_, element) => {
      const text = $(element).text();
      
      // Look for percentage patterns
      const rateMatch = text.match(/(\d+(?:[,.]\d+)?)\s*%/);
      if (rateMatch && text.toLowerCase().includes('työttömyys')) {
        const rate = parseFloat(rateMatch[1].replace(',', '.')) / 100;
        if (rate > 0 && rate < 0.1) { // Unemployment insurance is typically 1-2%
          rates.unemploymentInsurance = rate;
          console.log(`✅ Found unemployment insurance rate: ${(rate * 100).toFixed(2)}%`);
        }
      }
    });
  }

  // Fallback: Look for unemployment insurance in table format
  if (!rates.unemploymentInsurance) {
    const tables = $('table');
    
    tables.each((_, table) => {
      const rows = $(table).find('tr');
      
      rows.each((_, row) => {
        const cells = $(row).find('td, th');
        
        if (cells.length >= 2) {
          const labelCell = $(cells[0]).text().toLowerCase();
          const rateCell = $(cells[1]).text();
          
          if (labelCell.includes('työttömyys')) {
            const rate = parseRate(rateCell);
            if (rate !== null) {
              rates.unemploymentInsurance = rate;
              console.log(`✅ Found unemployment insurance rate in table: ${(rate * 100).toFixed(2)}%`);
            }
          }
        }
      });
    });
  }
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
function savePensionRates(data: PensionRates): void {
  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save with pretty formatting
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 Saved pension rates to ${OUTPUT_FILE}`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    const pensionRates = await scrapePensionRates();
    savePensionRates(pensionRates);
    
    console.log('✅ Pension rates scraping completed successfully!');
    console.log(`📊 Rates scraped: ${Object.keys(pensionRates).length} items`);
    console.log(`📅 Last updated: ${pensionRates.lastUpdated}`);
    
  } catch (error) {
    console.error('💥 Failed to scrape pension rates:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scrapePensionRates, parseRate };
