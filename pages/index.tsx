import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAllMunicipalitySlugs, getMunicipalityBySlug } from '@/lib/taxDataFI';
import { LightningIcon, ChartBarIcon, LockClosedIcon } from '@/components/icons';
import { HamburgerMenu } from '@/components/HamburgerMenu';

export default function Home() {
  const router = useRouter();
  const allMunicipalitySlugs = getAllMunicipalitySlugs();
  const topMunicipalitySlugs = allMunicipalitySlugs.slice(0, 6);

  return (
    <>
      <Head>
        <title>Nettopalkka Laskuri Suomi - Laske verot ja nettopalkka</title>
        <meta name="description" content="Laske nettopalkkasi ja verot Suomessa. Ilmainen nettopalkka laskuri kaikille suomalaisille kunnille. Sisältää YEL/TyEL maksut ja ajantasaiset veroprosentit." />
        <meta name="keywords" content="nettopalkka, verolaskuri, palkka laskuri, suomi, verot, YEL, TyEL" />
        <link rel="canonical" href="https://nettopalkka.fi" />
      </Head>

      <div className="min-h-screen bg-hero-gradient">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center">
                <Link href="/" className="text-lg sm:text-xl lg:text-2xl font-bold text-primary-800">
                  Nettopalkka.fi
                </Link>
              </div>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex space-x-6 lg:space-x-8">
                <Link href="/fi/nettopalkka-laskuri" className="text-sm lg:text-base text-gray-600 hover:text-primary-600 transition-colors">
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
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Nettopalkka Laskuri
              <span className="block text-primary-600">Suomi</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed">
              Laske nettopalkkasi ja verot kaikissa suomalaisissa kunnissa. 
              Ilmainen, nopea ja luotettava laskuri ajantasaisilla veroprosenteilla.
            </p>
            
            {/* Trust Chips */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
              <span className="trust-chip text-xs sm:text-sm">Käyttää virallisia verotietoja</span>
              <span className="trust-chip text-xs sm:text-sm">Päivitetty 2025</span>
              <span className="trust-chip text-xs sm:text-sm">Sisältää YEL/TyEL maksut</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm sm:max-w-none mx-auto">
              <Link href="/fi/nettopalkka-laskuri" className="btn-primary text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8">
                Laske Nettopalkka
              </Link>
              <Link href="/fi/verolaskuri" className="btn-secondary text-sm sm:text-base py-3 sm:py-4 px-6 sm:px-8">
                Vero Laskuri
              </Link>
            </div>
          </div>
        </section>

        {/* Municipality Grid */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Valitse kunta
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Löydä nettopalkka laskuri omalle kunnallesi. 
                Kaikki laskelmat sisältävät kunnalliset veroprosentit ja maksut.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
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

        {/* Features */}
        <section className="py-12 sm:py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-4">
                Miksi valita meidän laskuri?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <LightningIcon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Nopea ja helppo
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Laske nettopalkkasi muutamassa sekunnissa. 
                  Ei rekisteröitymistä, ei maksuja.
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <ChartBarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-success-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Ajantasaiset tiedot
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Käytämme virallisia verotietoja ja 
                  päivitämme tiedot vuosittain.
                </p>
              </div>

              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <LockClosedIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Turvallinen
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Tietosi eivät tallennu mihinkään. 
                  Laskelmat tehdään suoraan selaimessa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 sm:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              <div className="sm:col-span-2 lg:col-span-1">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Nettopalkka.fi</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  Suomen luotettavin nettopalkka ja vero laskuri.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Laskurit</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/fi/nettopalkka-laskuri" className="hover:text-white text-sm sm:text-base transition-colors">Nettopalkka Laskuri</Link></li>
                  <li><Link href="/fi/verolaskuri" className="hover:text-white text-sm sm:text-base transition-colors">Vero Laskuri</Link></li>
                  <li><Link href="/fi/kaikki-kunnat" className="hover:text-white text-sm sm:text-base transition-colors">Kaikki Kunnat</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Tietoa</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white text-sm sm:text-base transition-colors">YEL/TyEL maksut</a></li>
                  <li><a href="#" className="hover:text-white text-sm sm:text-base transition-colors">Veroprosentit 2025</a></li>
                  <li><a href="#" className="hover:text-white text-sm sm:text-base transition-colors">Vähennykset</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Yhteystiedot</h4>
                <ul className="space-y-2 text-gray-300">
                  <li className="text-sm sm:text-base">info@nettopalkka.fi</li>
                  <li className="text-sm sm:text-base">+358 40 123 4567</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
              <p className="text-xs sm:text-sm">&copy; 2025 Nettopalkka.fi. Kaikki oikeudet pidätetään.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
