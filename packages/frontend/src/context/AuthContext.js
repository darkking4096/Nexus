import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useState, useCallback, useEffect } from 'react';
export const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Initialize auth state from localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUserId = localStorage.getItem('userId');
        if (storedToken && storedUserId) {
            setToken(storedToken);
            setUserId(storedUserId);
            setIsAuthenticated(true);
        }
        setIsLoading(false);
    }, []);
    const login = useCallback(async (email, password) => {
        try {
            const response = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) {
                throw new Error('Login failed');
            }
            const { userId: newUserId, token: newToken } = await response.json();
            setUserId(newUserId);
            setToken(newToken);
            setIsAuthenticated(true);
            localStorage.setItem('token', newToken);
            localStorage.setItem('userId', newUserId);
        }
        catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }, []);
    const signup = useCallback(async (email, password, name) => {
        try {
            const response = await fetch('http://localhost:3000/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });
            if (!response.ok) {
                throw new Error('Signup failed');
            }
            const { userId: newUserId, token: newToken } = await response.json();
            setUserId(newUserId);
            setToken(newToken);
            setIsAuthenticated(true);
            localStorage.setItem('token', newToken);
            localStorage.setItem('userId', newUserId);
        }
        catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }, []);
    const logout = useCallback(() => {
        setIsAuthenticated(false);
        setUserId(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
    }, []);
    if (isLoading) {
        return _jsx("div", { children: "Loading..." });
    }
    return (_jsx(AuthContext.Provider, { value: { isAuthenticated, userId, token, login, signup, logout }, children: children }));
};
//# sourceMappingURL=AuthContext.js.map