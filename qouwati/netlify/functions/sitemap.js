// netlify/functions/sitemap.js
// Auto-generates sitemap.xml for SEO
const { getCollection } = require('./db');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') return { statusCode: 405, body: 'Method not allowed' };

  try {
    const posts = await getCollection('posts');
    const published = posts.filter(p => p.status === 'published');
    const base = process.env.SITE_URL || 'https://qouwati.com';

    const staticPages = ['', '#about', '#tips', '#diary', '#faq', '#resources', '#contact'];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticPages.map(page => `
  <url>
    <loc>${base}/${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
  ${published.map(p => `
  <url>
    <loc>${base}/#post-${p.id}</loc>
    <lastmod>${new Date(p.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/xml' },
      body: xml,
    };
  } catch (e) {
    console.error('sitemap:', e);
    return { statusCode: 500, body: 'Error generating sitemap' };
  }
};
