import fs from 'fs';
import path from 'path';

const distPath = path.resolve('dist');
const indexHtmlPath = path.join(distPath, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

  // 1. Create 404.html fallback (used by CDNs like Render and GitHub Pages)
  fs.writeFileSync(path.join(distPath, '404.html'), indexHtml);

  // 2. Create static route folders and files for every known route
  const routes = [
    'register',
    'login',
    'dashboard',
    'my-applications',
    'profile',
    'verify',
    'admin',
    'officer',
    'compliance',
    'schemes',
    'wizard',
    'help'
  ];

  for (const r of routes) {
    const routeDir = path.join(distPath, r);
    if (!fs.existsSync(routeDir)) fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml);
    fs.writeFileSync(path.join(distPath, `${r}.html`), indexHtml);
  }

  // 3. Ensure _redirects is present in dist
  const redirectsPath = path.join(distPath, '_redirects');
  if (!fs.existsSync(redirectsPath)) {
    fs.writeFileSync(redirectsPath, '/*    /index.html   200\n');
  }

  console.log('✓ SPA static route fallbacks and 404.html generated in dist.');
}
