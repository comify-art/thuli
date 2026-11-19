import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

export interface PrivateRouteProps {
    children: ReactNode;
    isAuthenticated: boolean;
    isLoading: boolean;
    isAuthorized?: boolean;
    loginPath?: string;
    accessDeniedElement?: ReactNode;
}

const PrivateRoute = ({
    children,
    isAuthenticated,
    isLoading,
    isAuthorized = true,
    loginPath = "/login",
    accessDeniedElement = <div>Access Denied</div>
}: PrivateRouteProps) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="w-8 h-8 border-4 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={loginPath} />;
    }

    if (!isAuthorized) {
        return <>{accessDeniedElement}</>;
    }

    return <>{children}</>;
};

export default PrivateRoute;

