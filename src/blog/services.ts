export interface BlogItem {
    id: string;
    title: string;
    date: string;
    author: string;
    description: string;
    thumbnail?: string;
    markdownUrl: string;
}

export const fetchBlogPosts = async (indexUrl: string): Promise<BlogItem[]> => {
    try {
        const response = await fetch(indexUrl);
        if (!response.ok) throw new Error('Failed to load blog index');
        const data = await response.json();
        return data as BlogItem[];
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return [];
    }
};
