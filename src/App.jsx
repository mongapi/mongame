import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './router/routes';

export default function App() {
    return (
        <Router>
            <AppRoutes />
        </Router>
    );
}