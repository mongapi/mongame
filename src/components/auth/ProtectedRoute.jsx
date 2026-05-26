import { Navigate } from 'react-router-dom';
/**
 * Componente que protege rutas que requieren autenticación
 * @param {*} children - Componentes hijos
 * @param {*} allowedRoles - Roles permitidos
 * @returns Componente protegido si el usuario está autenticado y tiene el rol adecuado, o redirección a login si no lo está
 */
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