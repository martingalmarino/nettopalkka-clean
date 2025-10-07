import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DataVerification {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    municipalRates: number;
    nationalBrackets: number;
    pensionRates: number;
  };
}

/**
 * Verifies the quality and consistency of scraped tax data
 */
async function verifyScrapedData(): Promise<DataVerification> {
  console.log('🔍 Verifying scraped tax data...');
  
  const verification: DataVerification = {
    isValid: true,
    errors: [],
    warnings: [],
    statistics: {
      municipalRates: 0,
      nationalBrackets: 0,
      pensionRates: 0
    }
  };

  try {
    // Verify municipal rates
    await verifyMunicipalRates(verification);
    
    // Verify national brackets
    await verifyNationalBrackets(verification);
    
    // Verify pension rates
    await verifyPensionRates(verification);
    
    // Cross-validate data consistency
    crossValidateData(verification);
    
  } catch (error) {
    verification.isValid = false;
    verification.errors.push(`Verification failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return verification;
}

/**
 * Verifies municipal tax rates data
 */
async function verifyMunicipalRates(verification: DataVerification): Promise<void> {
  const filePath = path.join(__dirname, '../data/municipal-rates.json');
  
  if (!fs.existsSync(filePath)) {
    verification.errors.push('Municipal rates file not found');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    verification.statistics.municipalRates = Object.keys(data).length;

    // Check for required municipalities
    const requiredMunicipalities = ['helsinki', 'espoo', 'vantaa', 'tampere', 'turku', 'oulu'];
    const missingMunicipalities = requiredMunicipalities.filter(municipality => !data[municipality]);
    
    if (missingMunicipalities.length > 0) {
      verification.errors.push(`Missing required municipalities: ${missingMunicipalities.join(', ')}`);
    }

    // Validate rate ranges
    Object.entries(data).forEach(([municipality, rate]) => {
      if (typeof rate !== 'number') {
        verification.errors.push(`Invalid rate type for ${municipality}: ${typeof rate}`);
      } else if (rate < 0.05 || rate > 0.25) {
        verification.warnings.push(`Unusual rate for ${municipality}: ${(rate * 100).toFixed(1)}%`);
      }
    });

    // Check for duplicate rates
    const rateCounts: { [key: number]: string[] } = {};
    Object.entries(data).forEach(([municipality, rate]) => {
      if (!rateCounts[rate as number]) {
        rateCounts[rate as number] = [];
      }
      rateCounts[rate as number].push(municipality);
    });

    Object.entries(rateCounts).forEach(([rate, municipalities]) => {
      if (municipalities.length > 10) {
        verification.warnings.push(`Many municipalities have the same rate ${(parseFloat(rate) * 100).toFixed(1)}%: ${municipalities.length} municipalities`);
      }
    });

  } catch (error) {
    verification.errors.push(`Failed to parse municipal rates: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verifies national tax brackets data
 */
async function verifyNationalBrackets(verification: DataVerification): Promise<void> {
  const filePath = path.join(__dirname, '../data/national-brackets.json');
  
  if (!fs.existsSync(filePath)) {
    verification.errors.push('National brackets file not found');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    verification.statistics.nationalBrackets = data.length;

    if (!Array.isArray(data)) {
      verification.errors.push('National brackets should be an array');
      return;
    }

    if (data.length < 2) {
      verification.errors.push('Too few tax brackets');
    }

    // Validate bracket structure and progression
    let previousMax = -1;
    data.forEach((bracket: any, index: number) => {
      if (bracket.min === undefined || bracket.min === null || typeof bracket.min !== 'number') {
        verification.errors.push(`Invalid min value in bracket ${index + 1}: ${bracket.min}`);
      }
      if (bracket.max !== null && typeof bracket.max !== 'number') {
        verification.errors.push(`Invalid max value in bracket ${index + 1}`);
      }
      if (typeof bracket.rate !== 'number') {
        verification.errors.push(`Invalid rate in bracket ${index + 1}`);
      }

      // Check progression (allow for exact matches)
      if (bracket.min !== previousMax + 1 && bracket.min !== previousMax) {
        verification.warnings.push(`Gap in tax brackets: ${previousMax + 1} - ${bracket.min - 1}`);
      }
      previousMax = bracket.max || Infinity;

      // Validate rate progression
      if (index > 0 && bracket.rate < data[index - 1].rate) {
        verification.warnings.push(`Tax rate decreased in bracket ${index + 1}: ${(data[index - 1].rate * 100).toFixed(1)}% -> ${(bracket.rate * 100).toFixed(1)}%`);
      }
    });

    // Check that first bracket starts at 0
    if (data.length > 0 && data[0].min !== 0) {
      verification.warnings.push('First tax bracket should start at 0');
    }

    // Check that last bracket has no upper limit
    if (data.length > 0 && data[data.length - 1].max !== null) {
      verification.warnings.push('Last tax bracket should have no upper limit (max: null)');
    }

  } catch (error) {
    verification.errors.push(`Failed to parse national brackets: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Verifies pension and social contribution rates
 */
async function verifyPensionRates(verification: DataVerification): Promise<void> {
  const filePath = path.join(__dirname, '../data/pension-rates.json');
  
  if (!fs.existsSync(filePath)) {
    verification.errors.push('Pension rates file not found');
    return;
  }

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    verification.statistics.pensionRates = Object.keys(data).length;

    // Check required rates
    const requiredRates = ['TyEL', 'YEL', 'healthInsurance'];
    requiredRates.forEach(rate => {
      if (!data[rate]) {
        verification.errors.push(`Missing required rate: ${rate}`);
      } else if (typeof data[rate] !== 'number') {
        verification.errors.push(`Invalid rate type for ${rate}: ${typeof data[rate]}`);
      }
    });

    // Validate rate ranges
    if (data.TyEL && (data.TyEL < 0.05 || data.TyEL > 0.15)) {
      verification.warnings.push(`Unusual TyEL rate: ${(data.TyEL * 100).toFixed(2)}%`);
    }

    if (data.YEL && (data.YEL < 0.15 || data.YEL > 0.35)) {
      verification.warnings.push(`Unusual YEL rate: ${(data.YEL * 100).toFixed(2)}%`);
    }

    if (data.healthInsurance && (data.healthInsurance < 0.005 || data.healthInsurance > 0.025)) {
      verification.warnings.push(`Unusual health insurance rate: ${(data.healthInsurance * 100).toFixed(2)}%`);
    }

    // Check YEL > TyEL (self-employed typically pay more)
    if (data.YEL && data.TyEL && data.YEL <= data.TyEL) {
      verification.warnings.push('YEL rate should be higher than TyEL rate (self-employed vs employee)');
    }

  } catch (error) {
    verification.errors.push(`Failed to parse pension rates: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Cross-validates data consistency
 */
function crossValidateData(verification: DataVerification): void {
  // Check if total effective tax rates are reasonable
  const municipalRatesFile = path.join(__dirname, '../data/municipal-rates.json');
  const nationalBracketsFile = path.join(__dirname, '../data/national-brackets.json');
  const pensionRatesFile = path.join(__dirname, '../data/pension-rates.json');

  if (fs.existsSync(municipalRatesFile) && fs.existsSync(nationalBracketsFile) && fs.existsSync(pensionRatesFile)) {
    try {
      const municipalRates = JSON.parse(fs.readFileSync(municipalRatesFile, 'utf8'));
      const nationalBrackets = JSON.parse(fs.readFileSync(nationalBracketsFile, 'utf8'));
      const pensionRates = JSON.parse(fs.readFileSync(pensionRatesFile, 'utf8'));

      // Calculate effective tax rate for a sample income
      const sampleIncome = 50000;
      let nationalTax = 0;
      
      for (const bracket of nationalBrackets) {
        if (sampleIncome > bracket.min) {
          const taxableInBracket = Math.min(sampleIncome, bracket.max || sampleIncome) - bracket.min;
          nationalTax += taxableInBracket * bracket.rate;
        }
      }

      const municipalTax = sampleIncome * municipalRates.helsinki;
      const pensionContributions = sampleIncome * pensionRates.TyEL;
      const totalTaxes = nationalTax + municipalTax + pensionContributions;
      const effectiveTaxRate = totalTaxes / sampleIncome;

      if (effectiveTaxRate < 0.2 || effectiveTaxRate > 0.5) {
        verification.warnings.push(`Unusual effective tax rate for €50,000 income: ${(effectiveTaxRate * 100).toFixed(1)}%`);
      }

    } catch (error) {
      verification.warnings.push(`Cross-validation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    const verification = await verifyScrapedData();
    
    console.log('\n📊 Data Verification Results:');
    console.log(`   Municipal rates: ${verification.statistics.municipalRates} municipalities`);
    console.log(`   National brackets: ${verification.statistics.nationalBrackets} brackets`);
    console.log(`   Pension rates: ${verification.statistics.pensionRates} rates`);
    
    if (verification.errors.length > 0) {
      console.log('\n❌ Errors:');
      verification.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (verification.warnings.length > 0) {
      console.log('\n⚠️ Warnings:');
      verification.warnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    if (verification.isValid && verification.errors.length === 0) {
      console.log('\n✅ Data verification passed successfully!');
      process.exit(0);
    } else {
      console.log('\n❌ Data verification failed!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { verifyScrapedData };
