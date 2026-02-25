import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description?: string;
    keywords?: string;
    canonicalPath?: string;
}

const BASE_URL = 'https://goldentowerspa.vercel.app';

export const useSEO = ({ title, description, keywords, canonicalPath }: SEOProps) => {
    useEffect(() => {
        // Update Title
        const prevTitle = document.title;
        document.title = `${title} | Golden Tower Spa`;

        // Update Description
        let metaDescription = document.querySelector('meta[name="description"]');
        const originalDescription = metaDescription?.getAttribute('content') || '';
        if (description) {
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.setAttribute('name', 'description');
                document.head.appendChild(metaDescription);
            }
            metaDescription.setAttribute('content', description);
        }

        // Update Keywords
        let metaKeywords = document.querySelector('meta[name="keywords"]');
        const originalKeywords = metaKeywords?.getAttribute('content') || '';
        if (keywords) {
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.setAttribute('name', 'keywords');
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.setAttribute('content', keywords);
        }

        // Update OG tags
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const originalOgTitle = ogTitle?.getAttribute('content') || '';
        const originalOgDesc = ogDesc?.getAttribute('content') || '';
        if (ogTitle) ogTitle.setAttribute('content', `${title} | Golden Tower Spa`);
        if (ogDesc && description) ogDesc.setAttribute('content', description);

        // Update Canonical URL
        let canonical = document.querySelector('link[rel="canonical"]');
        const originalCanonical = canonical?.getAttribute('href') || '';
        if (canonicalPath && canonical) {
            canonical.setAttribute('href', `${BASE_URL}${canonicalPath}`);
        }

        // Update OG URL
        const ogUrl = document.querySelector('meta[property="og:url"]');
        const originalOgUrl = ogUrl?.getAttribute('content') || '';
        if (canonicalPath && ogUrl) {
            ogUrl.setAttribute('content', `${BASE_URL}${canonicalPath}`);
        }

        return () => {
            document.title = prevTitle;
            if (metaDescription && originalDescription) {
                metaDescription.setAttribute('content', originalDescription);
            }
            if (metaKeywords && originalKeywords) {
                metaKeywords.setAttribute('content', originalKeywords);
            }
            if (ogTitle && originalOgTitle) ogTitle.setAttribute('content', originalOgTitle);
            if (ogDesc && originalOgDesc) ogDesc.setAttribute('content', originalOgDesc);
            if (canonical && originalCanonical) canonical.setAttribute('href', originalCanonical);
            if (ogUrl && originalOgUrl) ogUrl.setAttribute('content', originalOgUrl);
        };
    }, [title, description, keywords, canonicalPath]);
};
