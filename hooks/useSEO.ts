import { useEffect } from 'react';

interface SEOProps {
    title: string;
    description?: string;
}

export const useSEO = ({ title, description }: SEOProps) => {
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

        return () => {
            document.title = prevTitle;
            if (metaDescription && originalDescription) {
                metaDescription.setAttribute('content', originalDescription);
            }
        };
    }, [title, description]);
};
