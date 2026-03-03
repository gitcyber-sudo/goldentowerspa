import { useState, useEffect, useCallback } from 'react';

interface PreloadProgress {
    [url: string]: number;
}

export function useAssetPreloader(urls: string[]) {
    const [progress, setProgress] = useState<PreloadProgress>(() =>
        urls.reduce((acc, url) => ({ ...acc, [url]: 0 }), {})
    );
    const [isReady, setIsReady] = useState(false);

    const preloadAsset = useCallback(async (url: string) => {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load ${url}`);

            const contentLength = response.headers.get('content-length');
            if (!contentLength) {
                // Fallback for missing content-length
                setProgress(prev => ({ ...prev, [url]: 100 }));
                return;
            }

            const total = parseInt(contentLength, 10);
            let loaded = 0;

            const reader = response.body?.getReader();
            if (!reader) {
                setProgress(prev => ({ ...prev, [url]: 100 }));
                return;
            }

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                loaded += value.length;
                const assetProgress = Math.round((loaded / total) * 100);

                setProgress(prev => ({ ...prev, [url]: assetProgress }));
            }
        } catch (error) {
            console.error(`Asset preloading error for ${url}:`, error);
            // Mark as 100% on error so we don't stall the loader forever
            setProgress(prev => ({ ...prev, [url]: 100 }));
        }
    }, []);

    useEffect(() => {
        if (urls.length === 0) {
            setIsReady(true);
            return;
        }

        const promises = urls.map(url => preloadAsset(url));

        Promise.all(promises).then(() => {
            // Ensure state is fully synced
            setIsReady(true);
        });
    }, [urls, preloadAsset]);

    const totalProgress = Math.round(
        Object.values(progress).reduce((a, b) => a + b, 0) / urls.length
    );

    return { totalProgress, isReady };
}
