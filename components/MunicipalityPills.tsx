'use client';

import Link from 'next/link';
import { getAllMunicipalitySlugs, getMunicipalityBySlug } from '@/lib/taxDataFI';

interface MunicipalityPillsProps {
  currentMunicipality: string;
  type: 'nettopalkka' | 'verolaskuri';
}

export function MunicipalityPills({ currentMunicipality, type }: MunicipalityPillsProps) {
  // Obtener los municipios principales (primeros 10)
  const allMunicipalitySlugs = getAllMunicipalitySlugs();
  const mainMunicipalitySlugs = allMunicipalitySlugs.slice(0, 10);
  
  // Filtrar el municipio actual y convertir a objetos
  const otherMunicipalities = mainMunicipalitySlugs
    .filter(slug => slug !== currentMunicipality)
    .map(slug => getMunicipalityBySlug(slug));

  const getHref = (municipalitySlug: string) => {
    const basePath = type === 'nettopalkka' ? '/fi/nettopalkka-laskuri' : '/fi/verolaskuri';
    return `${basePath}/${municipalitySlug}`;
  };

  const getTaxRateColor = (rate: number) => {
    if (rate <= 19) return 'text-green-600 bg-green-50 border-green-200';
    if (rate <= 20.5) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (rate <= 21.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Nettopalkka muissa kaupungeissa
        </h3>
        <p className="text-sm text-gray-600">
          Vertaile veroprosentteja ja nettopalkkaa muissa suomalaisissa kaupungeissa
        </p>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {otherMunicipalities.map((municipality) => (
          <Link
            key={municipality.slug}
            href={getHref(municipality.slug)}
            className="group relative"
          >
            <div className={`municipality-pill group-hover:shadow-md transition-all duration-200 ${getTaxRateColor(municipality.municipalTaxRate)}`}>
              <div className="flex flex-col items-center space-y-1">
                <span className="font-medium text-sm">
                  {municipality.name}
                </span>
                <span className="text-xs opacity-75">
                  {municipality.municipalTaxRate}%
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-600">Alle 19%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-gray-600">19-20.5%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-gray-600">20.5-21.5%</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-600">Yli 21.5%</span>
            </div>
          </div>
          <Link 
            href="/fi/kaikki-kunnat"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Näytä kaikki →
          </Link>
        </div>
      </div>
    </div>
  );
}
