import Head from 'next/head';
import Link from 'next/link';
import { taxDataFI } from '@/lib/taxDataFI';

export default function KaikkiKunnatPage() {
  const title = 'Kaikki Kunnat - Nettopalkka Laskuri Suomi';
  const description = 'Nettopalkka laskuri kaikissa suomalaisissa kunnissa. Vertaile veroprosentteja ja laske nettopalkkasi missä tahansa kunnassa Suomessa.';

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content="kaikki kunnat, nettopalkka laskuri, veroprosentit, suomi, kunnallinen vero" />
        <link rel="canonical" href="https://nettopalkka.fi/fi/kaikki-kunnat" />
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
                <Link href="/fi/kaikki-kunnat" className="text-primary-600 font-medium">
                  Kaikki Kunnat
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Koti</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium">Kaikki Kunnat</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Kaikki Kunnat
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Löydä nettopalkka laskuri omalle kunnallesi. Vertaile veroprosentteja 
              ja laske nettopalkkasi missä tahansa suomalaisessa kunnassa.
            </p>
          </div>
        </section>

        {/* Municipality Grid */}
        <section className="py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taxDataFI.municipalities.map((municipality) => (
                <div key={municipality.slug} className="card p-6 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {municipality.name}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      municipality.municipalTaxRate <= 19 
                        ? 'bg-green-100 text-green-800'
                        : municipality.municipalTaxRate <= 20.5
                        ? 'bg-blue-100 text-blue-800'
                        : municipality.municipalTaxRate <= 21.5
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {municipality.municipalTaxRate}%
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kunnallinen vero:</span>
                      <span className="font-medium">{municipality.municipalTaxRate}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kansallinen vero:</span>
                      <span className="font-medium">Progressiivinen</span>
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Link
                      href={`/fi/nettopalkka-laskuri/${municipality.slug}`}
                      className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                    >
                      Nettopalkka
                    </Link>
                    <Link
                      href={`/fi/verolaskuri/${municipality.slug}`}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-center"
                    >
                      Verot
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Veroprosenttien tilastot
              </h2>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {taxDataFI.municipalities.filter(m => m.municipalTaxRate <= 19).length}
                </div>
                <div className="text-sm text-gray-600">Alle 19%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {taxDataFI.municipalities.filter(m => m.municipalTaxRate > 19 && m.municipalTaxRate <= 20.5).length}
                </div>
                <div className="text-sm text-gray-600">19-20.5%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {taxDataFI.municipalities.filter(m => m.municipalTaxRate > 20.5 && m.municipalTaxRate <= 21.5).length}
                </div>
                <div className="text-sm text-gray-600">20.5-21.5%</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {taxDataFI.municipalities.filter(m => m.municipalTaxRate > 21.5).length}
                </div>
                <div className="text-sm text-gray-600">Yli 21.5%</div>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Keskimääräinen kunnallinen vero
              </h3>
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {(taxDataFI.municipalities.reduce((sum, m) => sum + m.municipalTaxRate, 0) / taxDataFI.municipalities.length).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">
                Kaikkien {taxDataFI.municipalities.length} kunnan keskiarvo vuonna 2025
              </p>
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
