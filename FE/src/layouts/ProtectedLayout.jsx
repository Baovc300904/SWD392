import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedLayout({ allowedRoles = [] }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#F27125] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on actual role
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'lecturer') return <Navigate to="/lecturer" replace />;
        return <Navigate to="/workspace" replace />;
    }

    return <Outlet />;
}

export function PublicLayout() {
    const { user } = useAuth();

    // If already logged in, redirect to workspace/dashboard
    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin" replace />;
        if (user.role === 'lecturer') return <Navigate to="/lecturer" replace />;
        return <Navigate to="/workspace" replace />;
    }

    return <Outlet />;
}
