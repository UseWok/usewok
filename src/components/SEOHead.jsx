import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SEO_CONFIG, SEO_DEFAULT } from '@/lib/seo-config';

/**
 * SEOHead — à mettre dans les routes publiques uniquement.
 * Met à jour <title> et les balises <meta> de la page active.
 */
export default function SEOHead() {
  const { pathname } = useLocation();

  useEffect(() => {
    const seo = SEO_CONFIG[pathname] || SEO_DEFAULT;

    // Title
    document.title = seo.title;

    // Meta description
    let desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', seo.description);

    // OG title & description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', seo.title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', seo.description);

    // Twitter
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', seo.title);

    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', seo.description);
  }, [pathname]);

  return null;
}