import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
export const Layout = ({ children }) => {
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    if (!isAuthenticated) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs("div", { className: "min-h-screen flex", children: [_jsxs("aside", { className: "w-64 bg-gray-900 text-white p-6", children: [_jsx("h1", { className: "text-2xl font-bold mb-8", children: "NEXUS" }), _jsxs("nav", { className: "space-y-2", children: [_jsx("a", { href: "/dashboard", className: "block px-4 py-2 rounded hover:bg-gray-800", children: "Dashboard" }), _jsx("a", { href: "/profiles", className: "block px-4 py-2 rounded hover:bg-gray-800", children: "Profiles" }), _jsx("a", { href: "/content", className: "block px-4 py-2 rounded hover:bg-gray-800", children: "Content" })] })] }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsxs("header", { className: "bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "Dashboard" }), _jsx("button", { onClick: handleLogout, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition", children: "Logout" })] }), _jsx("main", { className: "flex-1 p-8 bg-gray-50", children: children })] })] }));
};
//# sourceMappingURL=Layout.js.map