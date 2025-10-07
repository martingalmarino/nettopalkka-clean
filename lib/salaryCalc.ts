import { taxDataFI, MunicipalityData } from './taxDataFI';

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
  const municipality = taxDataFI.municipalities.find(m => m.slug === inputs.municipality);
  if (!municipality) {
    throw new Error(`Municipality ${inputs.municipality} not found`);
  }

  const grossSalary = inputs.grossSalary;
  let deductions = inputs.hasDeductions ? (inputs.deductionAmount || 0) : 0;
  
  // Calcular impuesto nacional (progresivo)
  const nationalTax = calculateNationalTax(grossSalary);
  
  // Calcular impuesto municipal (porcentaje fijo)
  const municipalTax = (grossSalary * municipality.municipalTaxRate) / 100;
  
  // Calcular impuesto de iglesia (si aplica)
  const churchTax = municipality.churchTaxRate 
    ? (grossSalary * municipality.churchTaxRate) / 100 
    : 0;
  
  // Calcular contribuciones sociales
  let yelTax = 0;
  let tyelTax = 0;
  
  if (inputs.isEntrepreneur) {
    yelTax = (grossSalary * taxDataFI.yelRates.min) / 100;
  } else {
    tyelTax = (grossSalary * taxDataFI.tyelRate) / 100;
  }
  
  // Seguros sociales
  const unemploymentInsurance = (grossSalary * taxDataFI.unemploymentInsuranceRate) / 100;
  const healthInsurance = (grossSalary * taxDataFI.healthInsuranceRate) / 100;
  
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

function calculateNationalTax(grossSalary: number): number {
  let totalTax = 0;
  let remainingIncome = grossSalary;
  
  for (const bracket of taxDataFI.nationalTaxBrackets) {
    if (remainingIncome <= 0) break;
    
    const taxableInBracket = Math.min(
      remainingIncome,
      bracket.max ? bracket.max - bracket.min : remainingIncome
    );
    
    if (taxableInBracket > 0 && grossSalary > bracket.min) {
      totalTax += (taxableInBracket * bracket.rate) / 100;
      remainingIncome -= taxableInBracket;
    }
  }
  
  return totalTax;
}

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
  for (let i = taxDataFI.nationalTaxBrackets.length - 1; i >= 0; i--) {
    const bracket = taxDataFI.nationalTaxBrackets[i];
    if (grossSalary > bracket.min) {
      if (bracket.max) {
        return `${bracket.min.toLocaleString('fi-FI')}€ - ${bracket.max.toLocaleString('fi-FI')}€ (${bracket.rate}%)`;
      } else {
        return `${bracket.min.toLocaleString('fi-FI')}€+ (${bracket.rate}%)`;
      }
    }
  }
  return 'Sin impuestos';
}
