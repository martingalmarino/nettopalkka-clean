'use client';

import { TaxBreakdown, MonthlyBreakdown, formatCurrency, formatPercentage } from '@/lib/salaryCalc';
import { ExclamationTriangleIcon } from './icons';

interface ResultBreakdownProps {
  breakdown: TaxBreakdown;
  monthly: MonthlyBreakdown;
}

export function ResultBreakdown({ breakdown, monthly }: ResultBreakdownProps) {
  const taxItems = [
    {
      label: 'Kansallinen vero',
      amount: breakdown.nationalTax,
      percentage: ((breakdown.nationalTax / breakdown.grossSalary) * 100).toFixed(1) + '%',
      color: 'bg-blue-500'
    },
    {
      label: 'Kunnallinen vero',
      amount: breakdown.municipalTax,
      percentage: ((breakdown.municipalTax / breakdown.grossSalary) * 100).toFixed(1) + '%',
      color: 'bg-green-500'
    },
    ...(breakdown.isEntrepreneur ? [{
      label: 'YEL maksut',
      amount: breakdown.yelTax,
      percentage: ((breakdown.yelTax / breakdown.grossSalary) * 100).toFixed(1) + '%',
      color: 'bg-purple-500'
    }] : [{
      label: 'TyEL maksut',
      amount: breakdown.tyelTax,
      percentage: ((breakdown.tyelTax / breakdown.grossSalary) * 100).toFixed(1) + '%',
      color: 'bg-purple-500'
    }]),
    {
      label: 'Työttömyysvakuutus',
      amount: breakdown.unemploymentInsurance,
      percentage: ((breakdown.unemploymentInsurance / breakdown.grossSalary) * 100).toFixed(1) + '%',
      color: 'bg-yellow-500'
    },
    {
      label: 'Sairausvakuutus',
      amount: breakdown.healthInsurance,
      percentage: ((breakdown.healthInsurance / breakdown.grossSalary) * 100).toFixed(1) + '%',
      color: 'bg-red-500'
    }
  ].filter(item => item.amount > 0);

  if (breakdown.churchTax > 0) {
    taxItems.push({
      label: 'Kirkollisvero',
      amount: breakdown.churchTax,
      percentage: ((breakdown.churchTax / breakdown.grossSalary) * 100).toFixed(1) + '%',
      color: 'bg-indigo-500'
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-slide-up">
      {/* Main Results */}
      <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-2xl p-4 sm:p-6 border border-success-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-success-600">
              {formatCurrency(monthly.netMonthly)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Nettopalkka / kuukausi</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-primary-600">
              {formatCurrency(monthly.taxMonthly)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Verot ja maksut / kuukausi</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-800">
              {formatPercentage(breakdown.effectiveTaxRate)}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">Kokonaisveroaste</div>
          </div>
        </div>
      </div>

      {/* Annual Summary */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Vuosittainen yhteenveto</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Bruttopalkka:</span>
              <span className="font-medium">{formatCurrency(breakdown.grossSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kokonaisverot:</span>
              <span className="font-medium text-red-600">-{formatCurrency(breakdown.totalTaxes)}</span>
            </div>
            {breakdown.deductions > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Vähennykset:</span>
                <span className="font-medium text-success-600">+{formatCurrency(breakdown.deductions)}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Nettopalkka:</span>
              <span className="font-bold text-success-600">{formatCurrency(breakdown.netSalary)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Käteen jää:</span>
              <span className="font-bold text-success-600">
                {formatPercentage(100 - breakdown.effectiveTaxRate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Breakdown */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Verot ja maksut</h3>
        <div className="space-y-3">
          {taxItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                <span className="text-gray-700">{item.label}</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-800">
                  {formatCurrency(item.amount)}
                </div>
                <div className="text-sm text-gray-500">{item.percentage}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tax Breakdown Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Verorakenne</h3>
        <div className="space-y-2">
          {taxItems.map((item, index) => {
            const percentage = (item.amount / breakdown.totalTaxes) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.color} progress-bar`}
                    data-width={Math.round(percentage)}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="w-5 h-5 text-yellow-600 mt-0.5">
            <ExclamationTriangleIcon className="w-full h-full" />
          </div>
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Huomio</p>
            <p>
              Tämä on arvio nettopalkastasi. Lopullinen summa voi poiketa henkilökohtaisista 
              tekijöistäsi riippuen. Suosittelemme tarkistamaan laskelmat verottajan kanssa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
