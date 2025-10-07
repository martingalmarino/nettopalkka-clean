import { taxDataFI, getMunicipalRate, calculateNationalTax as calcNationalTax, getContributionRates } from './taxDataFI';

export interface SalaryInputs {
  grossSalary: number; // Salario bruto anual
  municipality: string; // Slug del municipio
  isEntrepreneur: boolean; // Si es empresario (YEL) o empleado (TyEL)
  hasDeductions: boolean; // Si tiene deducciones adicionales
  deductionAmount?: number; // Monto de deducciones
}

export interface TaxBreakdown {
  grossSalary: number;
  nationalTax: number;
  municipalTax: number;
  churchTax: number;
  yelTax: number;
  tyelTax: number;
  unemploymentInsurance: number;
  healthInsurance: number;
  totalTaxes: number;
  netSalary: number;
  effectiveTaxRate: number;
  deductions: number;
  isEntrepreneur: boolean;
}

export interface MonthlyBreakdown {
  grossMonthly: number;
  netMonthly: number;
  taxMonthly: number;
  breakdown: TaxBreakdown;
}

export function calculateSalaryBreakdown(inputs: SalaryInputs): TaxBreakdown {
  const grossSalary = inputs.grossSalary;
  let deductions = inputs.hasDeductions ? (inputs.deductionAmount || 0) : 0;
  
  // Obtener tasa municipal
  const municipalRate = getMunicipalRate(inputs.municipality);
  
  // Calcular impuesto nacional (progresivo)
  const nationalTax = calcNationalTax(grossSalary);
  
  // Calcular impuesto municipal (porcentaje fijo)
  const municipalTax = grossSalary * municipalRate;
  
  // No hay impuesto de iglesia en la nueva estructura
  const churchTax = 0;
  
  // Obtener tasas de contribuciones
  const contributions = getContributionRates();
  
  // Calcular contribuciones sociales
  let yelTax = 0;
  let tyelTax = 0;
  
  if (inputs.isEntrepreneur) {
    yelTax = grossSalary * contributions.YEL;
  } else {
    tyelTax = grossSalary * contributions.TyEL;
  }
  
  // Seguros sociales
  const unemploymentInsurance = grossSalary * contributions.unemploymentInsurance;
  const healthInsurance = grossSalary * contributions.healthInsurance;
  
  // Total de impuestos y contribuciones
  const totalTaxes = nationalTax + municipalTax + churchTax + yelTax + tyelTax + unemploymentInsurance + healthInsurance;
  
  // Salario neto
  const netSalary = grossSalary - totalTaxes + deductions;
  
  // Tasa efectiva de impuestos
  const effectiveTaxRate = (totalTaxes / grossSalary) * 100;
  
  return {
    grossSalary,
    nationalTax,
    municipalTax,
    churchTax,
    yelTax,
    tyelTax,
    unemploymentInsurance,
    healthInsurance,
    totalTaxes,
    netSalary,
    effectiveTaxRate,
    deductions,
    isEntrepreneur: inputs.isEntrepreneur
  };
}

export function calculateMonthlyBreakdown(inputs: SalaryInputs): MonthlyBreakdown {
  const annualBreakdown = calculateSalaryBreakdown(inputs);
  
  return {
    grossMonthly: annualBreakdown.grossSalary / 12,
    netMonthly: annualBreakdown.netSalary / 12,
    taxMonthly: annualBreakdown.totalTaxes / 12,
    breakdown: annualBreakdown
  };
}

// Esta función ya existe en taxDataFI.ts como calculateNationalTax

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fi-FI', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(1)}%`;
}

export function getTaxBracketInfo(grossSalary: number): string {
  for (let i = taxDataFI.nationalBrackets.length - 1; i >= 0; i--) {
    const bracket = taxDataFI.nationalBrackets[i];
    if (grossSalary > bracket.min) {
      if (bracket.max) {
        return `${bracket.min.toLocaleString('fi-FI')}€ - ${bracket.max.toLocaleString('fi-FI')}€ (${(bracket.rate * 100)}%)`;
      } else {
        return `${bracket.min.toLocaleString('fi-FI')}€+ (${(bracket.rate * 100)}%)`;
      }
    }
  }
  return 'Sin impuestos';
}
