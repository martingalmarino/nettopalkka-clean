import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { GetStaticPaths, GetStaticProps } from 'next';
import { taxDataFI, getMunicipalityBySlug, getMunicipalityName, getAllMunicipalitySlugs } from '@/lib/taxDataFI';
import { CalculatorCard } from '@/components/CalculatorCard';
import { MunicipalityPills } from '@/components/MunicipalityPills';
import { FAQAccordion } from '@/components/FAQAccordion';
import { HamburgerMenu } from '@/components/HamburgerMenu';

interface MunicipalityPageProps {
  municipality: {
    name: string;
    slug: string;
    municipalTaxRate: number;
  };
}

export default function MunicipalityNettopalkkaPage({ municipality }: MunicipalityPageProps) {
  const router = useRouter();
  const title = `Nettopalkka Laskuri ${municipality.name} - Laske verot ja nettopalkka`;
  const description = `Laske nettopalkkasi ${municipality.name}ssa. Ilmainen nettopalkka laskuri kunnallisen veroprosentin ${municipality.municipalTaxRate}% kanssa. Sisältää YEL/TyEL maksut.`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={`nettopalkka, ${municipality.name}, verolaskuri, palkka laskuri, kunnallinen vero, ${municipality.municipalTaxRate}%`} />
        <link rel="canonical" href={`https://nettopalkka.fi/fi/nettopalkka-laskuri/${municipality.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://nettopalkka.fi/fi/nettopalkka-laskuri/${municipality.slug}`} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
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
              <HamburgerMenu currentPath={router.pathname} />
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex space-x-2 text-sm">
              <Link href="/" className="text-gray-500 hover:text-gray-700">Koti</Link>
              <span className="text-gray-400">/</span>
              <Link href="/fi/nettopalkka-laskuri" className="text-gray-500 hover:text-gray-700">Nettopalkka Laskuri</Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-800 font-medium">{municipality.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nettopalkka Laskuri – {municipality.name}
            </h1>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              Laske nettopalkkasi {municipality.name}ssa kunnallisen veroprosentin {municipality.municipalTaxRate}% kanssa. 
              Ilmainen laskuri sisältää kaikki verot ja maksut.
            </p>
            
            {/* Trust Chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              <span className="trust-chip">Kunnallinen vero {municipality.municipalTaxRate}%</span>
              <span className="trust-chip">Päivitetty 2025</span>
              <span className="trust-chip">Sisältää YEL/TyEL maksut</span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Calculator */}
              <div className="lg:col-span-2">
                <CalculatorCard 
                  municipalitySlug={municipality.slug}
                  municipalityName={municipality.name}
                />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Municipality Info */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {municipality.name} - Verotiedot
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kunnallinen vero:</span>
                      <span className="font-semibold text-primary-600">
                        {municipality.municipalTaxRate}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kansallinen vero:</span>
                      <span className="font-semibold">Progressiivinen</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">YEL/TyEL:</span>
                      <span className="font-semibold">Sisältyy</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="card p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Muut laskurit
                  </h3>
                  <div className="space-y-3">
                    <Link 
                      href={`/fi/verolaskuri/${municipality.slug}`}
                      className="block w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Vero Laskuri
                    </Link>
                    <Link 
                      href="/fi/kaikki-kunnat"
                      className="block w-full bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Kaikki Kunnat
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Municipality Pills */}
        <section className="py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <MunicipalityPills 
              currentMunicipality={municipality.slug}
              type="nettopalkka"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <FAQAccordion 
              municipalityName={municipality.name}
              municipalitySlug={municipality.slug}
            />
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

export const getStaticPaths: GetStaticPaths = async () => {
  const municipalitySlugs = getAllMunicipalitySlugs();
  const paths = municipalitySlugs.map((slug) => ({
    params: { municipality: slug }
  }));

  return {
    paths,
    fallback: false
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const municipalitySlug = params?.municipality as string;
  const municipality = getMunicipalityBySlug(municipalitySlug);

  if (!municipality) {
    return {
      notFound: true
    };
  }

  return {
    props: {
      municipality
    }
  };
};
