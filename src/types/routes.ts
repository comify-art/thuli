import { ReactNode } from 'react';

export interface RouteConfig {
    path: string;
    element: ReactNode;
    title: string;
    description?: string;
    image?: string;
    protected?: boolean;
}
