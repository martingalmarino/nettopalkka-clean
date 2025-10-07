'use client';

import { useState } from 'react';
import { SalaryInputs, calculateMonthlyBreakdown, formatCurrency } from '@/lib/salaryCalc';
import { getMunicipalRate } from '@/lib/taxDataFI';
import { ResultBreakdown } from './ResultBreakdown';

interface CalculatorCardProps {
  municipalitySlug: string;
  municipalityName: string;
}

export function CalculatorCard({ municipalitySlug, municipalityName }: CalculatorCardProps) {
  const [inputs, setInputs] = useState<SalaryInputs>({
    grossSalary: 50000,
    municipality: municipalitySlug,
    isEntrepreneur: false,
    hasDeductions: false,
    deductionAmount: 0
  });

  const [result, setResult] = useState<ReturnType<typeof calculateMonthlyBreakdown> | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    
    // Simular un pequeño delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    try {
      const breakdown = calculateMonthlyBreakdown(inputs);
      setResult(breakdown);
    } catch (error) {
      console.error('Error calculating salary:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleInputChange = (field: keyof SalaryInputs, value: any) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="card p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Nettopalkka Laskuri
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Laske nettopalkkasi {municipalityName}ssa
          </p>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          {/* Gross Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bruttopalkka (vuosittain)
            </label>
            <div className="relative">
              <input
                type="number"
                value={inputs.grossSalary}
                onChange={(e) => handleInputChange('grossSalary', Number(e.target.value))}
                className="input-field pr-12 text-sm sm:text-base"
                placeholder="50000"
                min="0"
                step="1000"
              />
              <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm sm:text-base">
                €
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Syötä vuosittainen bruttopalkkasi
            </p>
          </div>

          {/* Employment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Työsuhteen tyyppi
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleInputChange('isEntrepreneur', false)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !inputs.isEntrepreneur
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Työntekijä</div>
                  <div className="text-sm opacity-75">TyEL maksut</div>
                </div>
              </button>
              <button
                onClick={() => handleInputChange('isEntrepreneur', true)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  inputs.isEntrepreneur
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">Yrittäjä</div>
                  <div className="text-sm opacity-75">YEL maksut</div>
                </div>
              </button>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="hasDeductions"
                checked={inputs.hasDeductions}
                onChange={(e) => handleInputChange('hasDeductions', e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="hasDeductions" className="text-sm font-medium text-gray-700">
                Minulla on vähennyksiä
              </label>
            </div>
            
            {inputs.hasDeductions && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vähennykset (vuosittain)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputs.deductionAmount || 0}
                    onChange={(e) => handleInputChange('deductionAmount', Number(e.target.value))}
                    className="input-field pr-12"
                    placeholder="0"
                    min="0"
                    step="100"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                    €
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Esim. työmatkakulut, ammattimaiset välineet
                </p>
              </div>
            )}
          </div>

          {/* Municipality Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-800">Kunnallinen vero</div>
                <div className="text-sm text-gray-600">{municipalityName}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-primary-600">
                  {(getMunicipalRate(municipalitySlug) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">vuosittain</div>
              </div>
            </div>
          </div>
        </div>

        {/* Calculate Button */}
        <button
          onClick={handleCalculate}
          disabled={isCalculating || inputs.grossSalary <= 0}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8 w-full"
        >
          {isCalculating ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Lasketaan...</span>
            </div>
          ) : (
            'Laske Nettopalkka'
          )}
        </button>

        {/* Results */}
        {result && (
          <div className="animate-fade-in">
            <ResultBreakdown breakdown={result.breakdown} monthly={result} />
          </div>
        )}
      </div>
    </div>
  );
}
