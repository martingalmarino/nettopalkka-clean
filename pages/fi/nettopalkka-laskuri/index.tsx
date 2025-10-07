import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAllMunicipalitySlugs, getMunicipalityBySlug } from '@/lib/taxDataFI';
import { HamburgerMenu } from '@/components/HamburgerMenu';

export default function NettopalkkaIndex() {
  const router = useRouter();
  const municipalitySlugs = getAllMunicipalitySlugs();
  const topMunicipalitySlugs = municipalitySlugs.slice(0, 12);

  return (
    <>
      <Head>
        <title>Nettopalkka Laskuri - Laske verot ja nettopalkka</title>
        <meta name="description" content="Laske nettopalkkasi ja verot Suomessa. Ilmainen nettopalkka laskuri kaikille suomalaisille kunnille." />
        <link rel="canonical" href="https://www.verolaskuri.com/fi/nettopalkka-laskuri" />
      </Head>

      <div className="min-h-screen bg-hero-gradient">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center">
                <Link href="/" className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-800">
                  Nettopalkka.fi
                </Link>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6 lg:space-x-8">
                <Link href="/fi/nettopalkka-laskuri" className="text-sm lg:text-base text-primary-600 font-medium">
                  Nettopalkka Laskuri
                </Link>
                <Link href="/fi/verolaskuri" className="text-sm lg:text-base text-gray-600 hover:text-primary-600 transition-colors">
                  Vero Laskuri
                </Link>
                <Link href="/fi/kaikki-kunnat" className="text-sm lg:text-base text-gray-600 hover:text-primary-600 transition-colors">
                  Kaikki Kunnat
                </Link>
              </nav>
              {/* Mobile Navigation */}
              <HamburgerMenu currentPath={router.pathname} />
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Nettopalkka Laskuri
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Valitse kunta ja laske nettopalkkasi. Kaikki laskelmat sisältävät 
              kunnalliset veroprosentit, kansallisen veron ja YEL/TyEL maksut.
            </p>
          </div>
        </section>

        {/* Municipality Grid */}
        <section className="py-6 sm:py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4">
              {topMunicipalitySlugs.map((slug) => {
                const municipality = getMunicipalityBySlug(slug);
                return (
                  <Link
                    key={slug}
                    href={`/fi/nettopalkka-laskuri/${slug}`}
                    className="group"
                  >
                    <div className="card p-3 sm:p-4 lg:p-6 text-center hover:shadow-xl transition-shadow duration-300">
                      <div className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-primary-600 transition-colors">
                        {municipality.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {municipality.municipalTaxRate}%
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="text-center mt-6 sm:mt-8">
              <Link 
                href="/fi/kaikki-kunnat"
                className="text-primary-600 hover:text-primary-700 font-semibold text-sm sm:text-base transition-colors"
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
