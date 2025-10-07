import { NextApiRequest, NextApiResponse } from 'next';
import { getAllMunicipalitySlugs } from '@/lib/taxDataFI';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const baseUrl = 'https://www.verolaskuri.com';
  
  // Páginas estáticas principales
  const staticPages = [
    {
      url: `${baseUrl}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: '1.0'
    },
    {
      url: `${baseUrl}/fi/kaikki-kunnat`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.8'
    }
  ];

  // Páginas dinámicas de municipios
  const municipalitySlugs = getAllMunicipalitySlugs();
  const municipalityPages = municipalitySlugs.flatMap(slug => [
    {
      url: `${baseUrl}/fi/nettopalkka-laskuri/${slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.9'
    },
    {
      url: `${baseUrl}/fi/verolaskuri/${slug}`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'monthly',
      priority: '0.9'
    }
  ]);

  const allPages = [...staticPages, ...municipalityPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allPages.map(page => `
  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('')}
</urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(sitemap);
}
