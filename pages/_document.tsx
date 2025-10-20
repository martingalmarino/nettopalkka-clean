import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="fi">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Favicon */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Apple touch icon intentionally omitted to satisfy linter */}
        
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="P97-QhcgIMZBzh_kfJJZMZanhEWvTyfnEvLXxWqjxGU" />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6771833588582297"
          crossOrigin="anonymous"
        />
        
        {/* Cookiehub */}
        <script src="https://cdn.cookiehub.eu/c2/ea5ba7aa.js"></script>
        <script type="text/javascript" dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener("DOMContentLoaded", function(event) {
              var cpm = {};
              window.cookiehub.load(cpm);
            });
          `
        }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
