import { getMunicipalRate, getTaxBracket, calculateNationalTax, getContributionRates } from '../lib/taxDataFI';

describe('Tax Data Helper Functions', () => {
  describe('getMunicipalRate', () => {
    it('should return correct municipal rate for Helsinki', () => {
      const rate = getMunicipalRate('helsinki');
      expect(rate).toBe(0.176);
    });

    it('should return correct municipal rate for Tampere', () => {
      const rate = getMunicipalRate('tampere');
      expect(rate).toBe(0.195);
    });

    it('should handle municipality name normalization', () => {
      const rate1 = getMunicipalRate('Helsinki');
      const rate2 = getMunicipalRate('HELSINKI');
      const rate3 = getMunicipalRate('helsinki');
      
      expect(rate1).toBe(rate2);
      expect(rate2).toBe(rate3);
    });

    it('should return Helsinki rate as fallback for unknown municipality', () => {
      const rate = getMunicipalRate('unknown-city');
      expect(rate).toBe(0.176); // Helsinki rate as fallback
    });
  });

  describe('getTaxBracket', () => {
    it('should return correct bracket for low income', () => {
      const bracket = getTaxBracket(15000);
      expect(bracket).toEqual({
        min: 0,
        max: 19999,
        rate: 0.00
      });
    });

    it('should return correct bracket for medium income', () => {
      const bracket = getTaxBracket(30000);
      expect(bracket).toEqual({
        min: 20000,
        max: 40000,
        rate: 0.065
      });
    });

    it('should return correct bracket for high income', () => {
      const bracket = getTaxBracket(50000);
      expect(bracket).toEqual({
        min: 40001,
        max: 70000,
        rate: 0.125
      });
    });

    it('should return correct bracket for very high income', () => {
      const bracket = getTaxBracket(100000);
      expect(bracket).toEqual({
        min: 70001,
        max: null,
        rate: 0.175
      });
    });

    it('should return first bracket for zero income', () => {
      const bracket = getTaxBracket(0);
      expect(bracket).toEqual({
        min: 0,
        max: 19999,
        rate: 0.00
      });
    });
  });

  describe('calculateNationalTax', () => {
    it('should calculate zero tax for income below first bracket', () => {
      const tax = calculateNationalTax(15000);
      expect(tax).toBe(0);
    });

    it('should calculate correct tax for income in second bracket', () => {
      const tax = calculateNationalTax(30000);
      // Income 30,000 should be taxed as:
      // 0-19,999: 0% = 0
      // 20,000-30,000: 6.5% = 10,000 * 0.065 = 650
      expect(tax).toBeCloseTo(650, 0);
    });

    it('should calculate correct tax for income spanning multiple brackets', () => {
      const tax = calculateNationalTax(50000);
      // Income 50,000 should be taxed as:
      // 0-19,999: 0% = 0
      // 20,000-40,000: 6.5% = 20,000 * 0.065 = 1,300
      // 40,001-50,000: 12.5% = 10,000 * 0.125 = 1,250
      // Total: 2,550
      expect(tax).toBeCloseTo(2550, 0);
    });

    it('should calculate correct tax for high income', () => {
      const tax = calculateNationalTax(100000);
      // Income 100,000 should be taxed as:
      // 0-19,999: 0% = 0
      // 20,000-40,000: 6.5% = 20,000 * 0.065 = 1,300
      // 40,001-70,000: 12.5% = 30,000 * 0.125 = 3,750
      // 70,001-100,000: 17.5% = 30,000 * 0.175 = 5,250
      // Total: 10,300
      expect(tax).toBeCloseTo(10300, 0);
    });
  });

  describe('getContributionRates', () => {
    it('should return correct contribution rates', () => {
      const rates = getContributionRates();
      
      expect(rates.TyEL).toBe(0.0715);
      expect(rates.YEL).toBe(0.245);
      expect(rates.healthInsurance).toBe(0.014);
      expect(rates.unemploymentInsurance).toBe(0.0125);
    });

    it('should have YEL rate higher than TyEL rate', () => {
      const rates = getContributionRates();
      expect(rates.YEL).toBeGreaterThan(rates.TyEL);
    });

    it('should have reasonable contribution rates', () => {
      const rates = getContributionRates();
      
      // TyEL should be between 5% and 10%
      expect(rates.TyEL).toBeGreaterThan(0.05);
      expect(rates.TyEL).toBeLessThan(0.10);
      
      // YEL should be between 20% and 30%
      expect(rates.YEL).toBeGreaterThan(0.20);
      expect(rates.YEL).toBeLessThan(0.30);
      
      // Health insurance should be between 1% and 3%
      expect(rates.healthInsurance).toBeGreaterThan(0.01);
      expect(rates.healthInsurance).toBeLessThan(0.03);
      
      // Unemployment insurance should be between 1% and 2%
      expect(rates.unemploymentInsurance).toBeGreaterThan(0.01);
      expect(rates.unemploymentInsurance).toBeLessThan(0.02);
    });
  });
});

describe('Tax Calculation Integration', () => {
  it('should calculate realistic effective tax rate for €50,000 income in Helsinki', () => {
    const grossIncome = 50000;
    
    // Calculate components
    const nationalTax = calculateNationalTax(grossIncome);
    const municipalTax = grossIncome * getMunicipalRate('helsinki');
    const contributions = getContributionRates();
    const tyelContributions = grossIncome * contributions.TyEL;
    const healthInsurance = grossIncome * contributions.healthInsurance;
    const unemploymentInsurance = grossIncome * contributions.unemploymentInsurance;
    
    const totalTaxes = nationalTax + municipalTax + tyelContributions + healthInsurance + unemploymentInsurance;
    const effectiveTaxRate = totalTaxes / grossIncome;
    
    // Effective tax rate should be reasonable (around 30-40%)
    expect(effectiveTaxRate).toBeGreaterThan(0.30);
    expect(effectiveTaxRate).toBeLessThan(0.45);
    
    console.log(`€50,000 income in Helsinki:`);
    console.log(`  National tax: €${nationalTax.toFixed(0)}`);
    console.log(`  Municipal tax: €${municipalTax.toFixed(0)}`);
    console.log(`  TyEL contributions: €${tyelContributions.toFixed(0)}`);
    console.log(`  Health insurance: €${healthInsurance.toFixed(0)}`);
    console.log(`  Unemployment insurance: €${unemploymentInsurance.toFixed(0)}`);
    console.log(`  Total taxes: €${totalTaxes.toFixed(0)}`);
    console.log(`  Effective tax rate: ${(effectiveTaxRate * 100).toFixed(1)}%`);
  });

  it('should show tax differences between municipalities', () => {
    const grossIncome = 60000;
    
    const helsinkiRate = getMunicipalRate('helsinki');
    const tampereRate = getMunicipalRate('tampere');
    
    const helsinkiMunicipalTax = grossIncome * helsinkiRate;
    const tampereMunicipalTax = grossIncome * tampereRate;
    
    const difference = tampereMunicipalTax - helsinkiMunicipalTax;
    
    expect(difference).toBeGreaterThan(0); // Tampere should have higher municipal tax
    
    console.log(`€60,000 income municipal tax comparison:`);
    console.log(`  Helsinki (${(helsinkiRate * 100).toFixed(1)}%): €${helsinkiMunicipalTax.toFixed(0)}`);
    console.log(`  Tampere (${(tampereRate * 100).toFixed(1)}%): €${tampereMunicipalTax.toFixed(0)}`);
    console.log(`  Difference: €${difference.toFixed(0)}`);
  });
});