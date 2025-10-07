import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MunicipalRate {
  [key: string]: number;
}

const MUNICIPAL_TAX_URL = 'https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/kunnallisvero/';
const OUTPUT_FILE = path.join(__dirname, '../data/municipal-rates.json');

/**
 * Scrapes municipal income tax rates from Vero.fi
 * 
 * The page typically contains a table with municipality names and their tax rates.
 * We need to parse this table and normalize the municipality names to slugs.
 */
async function scrapeMunicipalRates(): Promise<MunicipalRate> {
  console.log('🏛️ Scraping municipal tax rates from Vero.fi...');
  
  try {
    // Fetch the page with proper headers to avoid blocking
    const response = await axios.get(MUNICIPAL_TAX_URL, {
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
    const municipalRates: MunicipalRate = {};

    // Look for tables containing municipal tax data
    // The table structure may vary, so we'll try multiple selectors
    const tableSelectors = [
      'table',
      '.table',
      '[class*="table"]',
      '[class*="kunnallisvero"]',
      '[class*="veroprosentti"]'
    ];

    let tableFound = false;

    for (const selector of tableSelectors) {
      const tables = $(selector);
      
      tables.each((_, table) => {
        const rows = $(table).find('tr');
        
        if (rows.length > 5) { // Likely a data table
          console.log(`📊 Found potential data table with ${rows.length} rows`);
          
          rows.each((_, row) => {
            const cells = $(row).find('td, th');
            
            if (cells.length >= 2) {
              const municipalityCell = $(cells[0]).text().trim();
              const rateCell = $(cells[1]).text().trim();
              
              // Skip header rows
              if (municipalityCell.toLowerCase().includes('kunta') || 
                  municipalityCell.toLowerCase().includes('municipality') ||
                  rateCell.toLowerCase().includes('%') ||
                  rateCell.toLowerCase().includes('prosentti')) {
                return;
              }
              
              // Extract municipality name and rate
              const municipality = normalizeMunicipalityName(municipalityCell);
              const rate = parseRate(rateCell);
              
              if (municipality && rate !== null) {
                municipalRates[municipality] = rate;
                console.log(`✅ ${municipality}: ${(rate * 100).toFixed(1)}%`);
                tableFound = true;
              }
            }
          });
        }
      });
      
      if (tableFound) break;
    }

    // Fallback: Look for specific patterns in the HTML
    if (!tableFound) {
      console.log('⚠️ No structured table found, searching for rate patterns...');
      
      const pageText = $.text();
      const ratePattern = /([A-ZÄÖÅa-zäöå\s]+):\s*(\d+[,.]?\d*)\s*%/g;
      let match;
      
      while ((match = ratePattern.exec(pageText)) !== null) {
        const municipality = normalizeMunicipalityName(match[1].trim());
        const rate = parseRate(match[2]);
        
        if (municipality && rate !== null) {
          municipalRates[municipality] = rate;
          console.log(`✅ Pattern match: ${municipality}: ${(rate * 100).toFixed(1)}%`);
        }
      }
    }

    // Validate that we got some data
    if (Object.keys(municipalRates).length === 0) {
      throw new Error('No municipal tax rates found on the page');
    }

    console.log(`📈 Successfully scraped ${Object.keys(municipalRates).length} municipal tax rates`);
    
    return municipalRates;

  } catch (error) {
    console.error('❌ Error scraping municipal rates:', error);
    
    // Try to load fallback data
    if (fs.existsSync(OUTPUT_FILE)) {
      console.log('📁 Loading fallback data from previous scrape...');
      const fallbackData = JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8'));
      console.log(`📋 Using fallback data with ${Object.keys(fallbackData).length} municipalities`);
      return fallbackData;
    }
    
    throw error;
  }
}

/**
 * Normalizes municipality name to a slug format
 */
function normalizeMunicipalityName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äöå]/g, (char) => {
      const map: { [key: string]: string } = { 'ä': 'a', 'ö': 'o', 'å': 'a' };
      return map[char] || char;
    })
    .replace(/[^a-z0-9]/g, '')
    .trim();
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
function saveMunicipalRates(data: MunicipalRate): void {
  // Ensure data directory exists
  const dataDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Save with pretty formatting
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
  console.log(`💾 Saved municipal rates to ${OUTPUT_FILE}`);
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    const municipalRates = await scrapeMunicipalRates();
    saveMunicipalRates(municipalRates);
    
    console.log('✅ Municipal rates scraping completed successfully!');
    console.log(`📊 Total municipalities: ${Object.keys(municipalRates).length}`);
    
    // Show sample of scraped data
    const sampleMunicipalities = Object.keys(municipalRates).slice(0, 5);
    console.log('📋 Sample data:');
    sampleMunicipalities.forEach(municipality => {
      console.log(`   ${municipality}: ${(municipalRates[municipality] * 100).toFixed(1)}%`);
    });
    
  } catch (error) {
    console.error('💥 Failed to scrape municipal rates:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { scrapeMunicipalRates, normalizeMunicipalityName, parseRate };
