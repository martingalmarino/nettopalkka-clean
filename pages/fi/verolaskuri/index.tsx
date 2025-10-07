import Head from 'next/head';
import Link from 'next/link';
import { getAllMunicipalitySlugs, getMunicipalityBySlug } from '@/lib/taxDataFI';

export default function VeroIndex() {
  const municipalitySlugs = getAllMunicipalitySlugs();
  const topMunicipalitySlugs = municipalitySlugs.slice(0, 12);

  return (
    <>
      <Head>
        <title>Vero Laskuri - Laske verot ja nettopalkka</title>
        <meta name="description" content="Laske verot ja nettopalkkasi Suomessa. Ilmainen vero laskuri kaikille suomalaisille kunnille." />
        <link rel="canonical" href="https://nettopalkka.fi/fi/verolaskuri" />
      </Head>

      <div className="min-h-screen bg-hero-gradient">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-800">
                  Nettopalkka.fi
                </Link>
              </div>
              <nav className="hidden md:flex space-x-8">
                <Link href="/fi/nettopalkka-laskuri" className="text-gray-600 hover:text-primary-600">
                  Nettopalkka Laskuri
                </Link>
                <Link href="/fi/verolaskuri" className="text-primary-600 font-medium">
                  Vero Laskuri
                </Link>
                <Link href="/fi/kaikki-kunnat" className="text-gray-600 hover:text-primary-600">
                  Kaikki Kunnat
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-6">
              Vero Laskuri
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Valitse kunta ja laske verosi. Näet yksityiskohtaisen erittelyn 
              kunnallisesta verosta, kansallisesta verosta ja muista maksuista.
            </p>
          </div>
        </section>

        {/* Municipality Grid */}
        <section className="py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {topMunicipalitySlugs.map((slug) => {
                const municipality = getMunicipalityBySlug(slug);
                return (
                  <Link
                    key={slug}
                    href={`/fi/verolaskuri/${slug}`}
                    className="group"
                  >
                    <div className="card p-6 text-center hover:shadow-xl transition-shadow duration-300">
                      <div className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                        {municipality.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {municipality.municipalTaxRate}%
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-8">
              <Link 
                href="/fi/kaikki-kunnat"
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                Näytä kaikki kunnat →
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
