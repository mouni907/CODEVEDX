import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
export default function ProtectedRoute({ children, allowedRoles }) {
    const { token, user, loading } = useSelector((state) => state.auth);
    if (loading && !user) {
        return (<div className="flex justify-center items-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>);
    }
    if (!token) {
        return <Navigate to="/login" replace/>;
    }
    if (user && allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect unauthorized roles to correct dashboards
        if (user.role === 'employer') {
            return <Navigate to="/employer-dashboard" replace/>;
        }
        else {
            return <Navigate to="/candidate-dashboard" replace/>;
        }
    }
    return <>{children}</>;
}
