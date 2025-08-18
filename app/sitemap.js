export default function sitemap() {
  const base = 'https://ghostaisolutions.com';
  const routes = ['', '/services', '/process', '/work', '/pricing', '/faq', '/contact', '/privacy', '/terms'];
  const now = new Date().toISOString();
  return routes.map((r) => ({
    url: `${base}${r}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: r === '' ? 1.0 : 0.7,
  }));
}
