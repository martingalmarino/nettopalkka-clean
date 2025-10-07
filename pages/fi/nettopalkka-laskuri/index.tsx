import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function NettopalkkaIndex() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Helsinki as default municipality
    router.replace('/fi/nettopalkka-laskuri/helsinki');
  }, [router]);

  return (
    <>
      <Head>
        <title>Nettopalkka Laskuri - Laske verot ja nettopalkka</title>
        <meta name="description" content="Laske nettopalkkasi ja verot Suomessa. Ilmainen nettopalkka laskuri kaikille suomalaisille kunnille." />
      </Head>
      <div className="min-h-screen bg-hero-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Ohjataan sinua Helsinki laskuriin...</p>
        </div>
      </div>
    </>
  );
}
