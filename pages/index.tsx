import Head from 'next/head';
import Link from 'next/link';
import { taxDataFI } from '@/lib/taxDataFI';
import { LightningIcon, ChartBarIcon, LockClosedIcon } from '@/components/icons';

export default function Home() {
  const topMunicipalities = taxDataFI.municipalities.slice(0, 6);

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
                <Link href="/fi/verolaskuri" className="text-gray-600 hover:text-primary-600">
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
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              Nettopalkka Laskuri
              <span className="block text-primary-600">Suomi</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Laske nettopalkkasi ja verot kaikissa suomalaisissa kunnissa. 
              Ilmainen, nopea ja luotettava laskuri ajantasaisilla veroprosenteilla.
            </p>
            
            {/* Trust Chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              <span className="trust-chip">Käyttää virallisia verotietoja</span>
              <span className="trust-chip">Päivitetty 2025</span>
              <span className="trust-chip">Sisältää YEL/TyEL maksut</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/fi/nettopalkka-laskuri/helsinki" className="btn-primary">
                Laske Nettopalkka
              </Link>
              <Link href="/fi/verolaskuri/helsinki" className="btn-secondary">
                Vero Laskuri
              </Link>
            </div>
          </div>
        </section>

        {/* Municipality Grid */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Valitse kunta
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Löydä nettopalkka laskuri omalle kunnallesi. 
                Kaikki laskelmat sisältävät kunnalliset veroprosentit ja maksut.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topMunicipalities.map((municipality) => (
                <Link
                  key={municipality.slug}
                  href={`/fi/nettopalkka-laskuri/${municipality.slug}`}
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
              ))}
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
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                Miksi valita meidän laskuri?
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LightningIcon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Nopea ja helppo
                </h3>
                <p className="text-gray-600">
                  Laske nettopalkkasi muutamassa sekunnissa. 
                  Ei rekisteröitymistä, ei maksuja.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChartBarIcon className="w-8 h-8 text-success-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Ajantasaiset tiedot
                </h3>
                <p className="text-gray-600">
                  Käytämme virallisia verotietoja ja 
                  päivitämme tiedot vuosittain.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockClosedIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Turvallinen
                </h3>
                <p className="text-gray-600">
                  Tietosi eivät tallennu mihinkään. 
                  Laskelmat tehdään suoraan selaimessa.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Nettopalkka.fi</h3>
                <p className="text-gray-300">
                  Suomen luotettavin nettopalkka ja vero laskuri.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Laskurit</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><Link href="/fi/nettopalkka-laskuri" className="hover:text-white">Nettopalkka Laskuri</Link></li>
                  <li><Link href="/fi/verolaskuri" className="hover:text-white">Vero Laskuri</Link></li>
                  <li><Link href="/fi/kaikki-kunnat" className="hover:text-white">Kaikki Kunnat</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Tietoa</h4>
                <ul className="space-y-2 text-gray-300">
                  <li><a href="#" className="hover:text-white">YEL/TyEL maksut</a></li>
                  <li><a href="#" className="hover:text-white">Veroprosentit 2025</a></li>
                  <li><a href="#" className="hover:text-white">Vähennykset</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Yhteystiedot</h4>
                <ul className="space-y-2 text-gray-300">
                  <li>info@nettopalkka.fi</li>
                  <li>+358 40 123 4567</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2025 Nettopalkka.fi. Kaikki oikeudet pidätetään.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
