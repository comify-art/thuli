import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";

export interface PageMetaProps {
    title: string;
    description?: string;
    image?: string;
    children: ReactNode;
    onPageView?: (path: string, title: string) => void;
}

const PageMeta = ({ title, description, image, children, onPageView }: PageMetaProps) => {
    const location = useLocation();

    useEffect(() => {
        document.title = title;

        // Helper to set meta tag
        const setMeta = (name: string, content: string | undefined, prop = false) => {
            if (!content) return;
            const key = prop ? 'property' : 'name';
            let element = document.querySelector(`meta[${key}="${name}"]`);
            if (!element) {
                element = document.createElement('meta');
                element.setAttribute(key, name);
                document.head.appendChild(element);
            }
            element.setAttribute('content', content);
        };

        setMeta('description', description);
        setMeta('og:title', title, true);
        setMeta('og:description', description, true);
        setMeta('og:image', image, true);
        setMeta('twitter:card', image ? 'summary_large_image' : 'summary');

        if (onPageView) {
            onPageView(location.pathname + location.search, title);
        }
    }, [title, description, image, location, onPageView]);

    return <>{children}</>;
};

export default PageMeta;

