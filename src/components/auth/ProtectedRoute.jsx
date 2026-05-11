import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = ['admin', 'teacher'] }) => {
    const userToken = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = user?.role;

    if (!userToken) {
        return <Navigate to="/login" />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;