export interface MunicipalityData {
  name: string;
  slug: string;
  municipalTaxRate: number; // Porcentaje
  churchTaxRate?: number; // Porcentaje (opcional)
}

export interface TaxBrackets {
  min: number;
  max?: number;
  rate: number;
}

export interface TaxData {
  nationalTaxBrackets: TaxBrackets[];
  municipalities: MunicipalityData[];
  yelRates: {
    min: number;
    max: number;
  };
  tyelRate: number;
  unemploymentInsuranceRate: number;
  healthInsuranceRate: number;
}

export const taxDataFI: TaxData = {
  // Brackets de impuesto nacional 2025 (aproximados)
  nationalTaxBrackets: [
    { min: 0, max: 22000, rate: 0 },
    { min: 22000, max: 33000, rate: 6 },
    { min: 33000, max: 47000, rate: 17.25 },
    { min: 47000, max: 81000, rate: 21.25 },
    { min: 81000, rate: 31.25 }
  ],
  
  // Principales municipios de Finlandia con sus tasas de impuesto municipal
  municipalities: [
    { name: 'Helsinki', slug: 'helsinki', municipalTaxRate: 18.0 },
    { name: 'Espoo', slug: 'espoo', municipalTaxRate: 18.5 },
    { name: 'Tampere', slug: 'tampere', municipalTaxRate: 20.5 },
    { name: 'Vantaa', slug: 'vantaa', municipalTaxRate: 19.0 },
    { name: 'Oulu', slug: 'oulu', municipalTaxRate: 20.0 },
    { name: 'Turku', slug: 'turku', municipalTaxRate: 20.0 },
    { name: 'Jyväskylä', slug: 'jyvaskyla', municipalTaxRate: 20.5 },
    { name: 'Lahti', slug: 'lahti', municipalTaxRate: 21.0 },
    { name: 'Kuopio', slug: 'kuopio', municipalTaxRate: 21.0 },
    { name: 'Pori', slug: 'pori', municipalTaxRate: 21.0 },
    { name: 'Kouvola', slug: 'kouvola', municipalTaxRate: 21.5 },
    { name: 'Joensuu', slug: 'joensuu', municipalTaxRate: 21.5 },
    { name: 'Lappeenranta', slug: 'lappeenranta', municipalTaxRate: 20.5 },
    { name: 'Hämeenlinna', slug: 'hameenlinna', municipalTaxRate: 21.0 },
    { name: 'Vaasa', slug: 'vaasa', municipalTaxRate: 20.5 },
    { name: 'Seinäjoki', slug: 'seinajoki', municipalTaxRate: 21.0 },
    { name: 'Rovaniemi', slug: 'rovaniemi', municipalTaxRate: 21.5 },
    { name: 'Mikkeli', slug: 'mikkeli', municipalTaxRate: 21.5 },
    { name: 'Kotka', slug: 'kotka', municipalTaxRate: 21.0 },
    { name: 'Salo', slug: 'salo', municipalTaxRate: 21.0 },
    { name: 'Porvoo', slug: 'porvoo', municipalTaxRate: 20.0 },
    { name: 'Lohja', slug: 'lohja', municipalTaxRate: 20.5 },
    { name: 'Hyvinkää', slug: 'hyvinkaa', municipalTaxRate: 20.5 },
    { name: 'Nurmijärvi', slug: 'nurmijarvi', municipalTaxRate: 19.5 },
    { name: 'Järvenpää', slug: 'jarvenpaa', municipalTaxRate: 20.0 },
    { name: 'Kirkkonummi', slug: 'kirkkonummi', municipalTaxRate: 19.0 },
    { name: 'Tuusula', slug: 'tuusula', municipalTaxRate: 20.0 },
    { name: 'Kerava', slug: 'kerava', municipalTaxRate: 19.5 },
    { name: 'Kauniainen', slug: 'kauniainen', municipalTaxRate: 17.5 },
    { name: 'Vihti', slug: 'vihti', municipalTaxRate: 20.5 }
  ],
  
  // Tasas de contribuciones sociales 2025
  yelRates: {
    min: 24.1, // Mínimo para YEL
    max: 24.1  // Máximo para YEL
  },
  
  tyelRate: 7.15, // TyEL para empleados
  unemploymentInsuranceRate: 0.69, // Seguro de desempleo
  healthInsuranceRate: 2.04 // Seguro de salud
};

export function getMunicipalityBySlug(slug: string): MunicipalityData | undefined {
  return taxDataFI.municipalities.find(m => m.slug === slug);
}

export function getAllMunicipalitySlugs(): string[] {
  return taxDataFI.municipalities.map(m => m.slug);
}

export function getMunicipalityName(slug: string): string {
  const municipality = getMunicipalityBySlug(slug);
  return municipality ? municipality.name : slug;
}
