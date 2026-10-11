
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar, { NavbarProps } from './Navbar';
import Footer, { FooterProps } from './Footer';
import PageMeta from './PageMeta';
import PrivateRoute from '../router/PrivateRoute';
import { RouteConfig } from '../types/routes';


export interface AppShellProps {
    routes: RouteConfig[];
    navbar: NavbarProps;
    footer: FooterProps;
    auth: {
        isAuthenticated: boolean;
        isLoading: boolean;
        isAuthorized?: boolean;
    };
    onPageView?: (path: string, title: string) => void;
    basename?: string;
}

const AppShell = ({ routes, navbar, footer, auth, onPageView, basename }: AppShellProps) => {
    return (
        <Router basename={basename}>
            <div className="app-shell-root">
                <Navbar {...navbar} />
                <main className="app-main">
                    <Routes>
                        {routes.map((route) => {
                            const Element = route.protected ? (
                                <PrivateRoute
                                    isAuthenticated={auth.isAuthenticated}
                                    isLoading={auth.isLoading}
                                    isAuthorized={auth.isAuthorized}
                                >
                                    {route.element}
                                </PrivateRoute>
                            ) : (
                                route.element
                            );

                            return (
                                <Route
                                    key={route.path}
                                    path={route.path}
                                    element={
                                        <PageMeta
                                            title={route.title}
                                            description={route.description}
                                            image={route.image}
                                            onPageView={onPageView}
                                        >
                                            {Element}
                                        </PageMeta>
                                    }
                                />
                            );
                        })}
                    </Routes>
                </main>
                <Footer {...footer} />
            </div>
        </Router>
    );
};

export default AppShell;
