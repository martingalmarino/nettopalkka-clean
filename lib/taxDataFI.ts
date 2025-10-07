// Auto-generated tax data for Finland
// Generated on: 07.10.2025 klo 18.22
// Data sources: https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/kunnallisvero/, https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tuloveroasteikko/, https://www.tyoelake.fi/

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

export const taxDataFI: TaxDataFI = {
  "nationalBrackets": [
    {
      "min": 0,
      "max": 19999,
      "rate": 0
    },
    {
      "min": 20000,
      "max": 40000,
      "rate": 0.065
    },
    {
      "min": 40001,
      "max": 70000,
      "rate": 0.125
    },
    {
      "min": 70001,
      "max": null,
      "rate": 0.175
    }
  ],
  "municipalRates": {
    "helsinki": 0.176,
    "espoo": 0.17,
    "vantaa": 0.175,
    "tampere": 0.195,
    "turku": 0.185,
    "oulu": 0.19,
    "jyvaskyla": 0.195,
    "lahti": 0.195,
    "kuopio": 0.195,
    "pori": 0.195,
    "kouvola": 0.195,
    "joensuu": 0.195,
    "lappeenranta": 0.195,
    "vaasa": 0.195,
    "hameenlinna": 0.195,
    "seinajoki": 0.195,
    "rovaniemi": 0.195,
    "mikkeli": 0.195,
    "kotka": 0.195,
    "saloh": 0.195
  },
  "contributions": {
    "TyEL": 0.0715,
    "YEL": 0.245,
    "healthInsurance": 0.014,
    "unemploymentInsurance": 0.0125
  },
  "metadata": {
    "lastUpdated": "2025-10-07T15:22:47.845Z",
    "dataSources": [
      "https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/kunnallisvero/",
      "https://www.vero.fi/henkiloasiakkaat/verokortti-ja-veroilmoitus/tuloveroasteikko/",
      "https://www.tyoelake.fi/"
    ],
    "version": "1.0.0"
  }
};

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

// Helper function to get municipality data by slug
export function getMunicipalityBySlug(slug: string) {
  const rate = getMunicipalRate(slug);
  const name = getMunicipalityName(slug);
  return {
    name: name,
    slug: slug,
    municipalTaxRate: parseFloat((rate * 100).toFixed(2)) // Convert to percentage and round to 2 decimals
  };
}

// Helper function to get municipality name by slug
export function getMunicipalityName(slug: string): string {
  const municipalityNames: { [key: string]: string } = {
    'helsinki': 'Helsinki',
    'espoo': 'Espoo',
    'vantaa': 'Vantaa',
    'tampere': 'Tampere',
    'turku': 'Turku',
    'oulu': 'Oulu',
    'jyvaskyla': 'Jyväskylä',
    'lahti': 'Lahti',
    'kuopio': 'Kuopio',
    'pori': 'Pori',
    'kouvola': 'Kouvola',
    'joensuu': 'Joensuu',
    'lappeenranta': 'Lappeenranta',
    'vaasa': 'Vaasa',
    'hameenlinna': 'Hämeenlinna',
    'seinajoki': 'Seinäjoki',
    'rovaniemi': 'Rovaniemi',
    'mikkeli': 'Mikkeli',
    'kotka': 'Kotka',
    'saloh': 'Salo'
  };
  
  return municipalityNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
}

// Helper function to get all municipality slugs
export function getAllMunicipalitySlugs(): string[] {
  return Object.keys(taxDataFI.municipalRates);
}
