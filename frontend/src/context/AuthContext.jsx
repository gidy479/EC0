import React, { createContext, useState, useEffect } from 'react';
import API_BASE_URL from '../config/apiConfig';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check local storage for user info on load
        const storedUser = localStorage.getItem('ecoMarketUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email, password) => {
        const loginUrl = `${API_BASE_URL}/api/auth/login`;
        try {
            console.log(`Attempting login at: ${loginUrl}`);
            const res = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                console.error(`Login failed with status ${res.status}:`, errorData);
                return { success: false, message: errorData.message || `Login failed (${res.status})` };
            }

            const data = await res.json();
            setUser(data);
            localStorage.setItem('ecoMarketUser', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            console.error(`Network error during login at ${loginUrl}:`, error);
            return { success: false, message: 'Server error. Please try again later.' };
        }
    };

    const register = async (name, email, password, role) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await res.json();
            if (res.ok) {
                setUser(data);
                localStorage.setItem('ecoMarketUser', JSON.stringify(data));
                return { success: true };
            } else {
                return { success: false, message: data.message };
            }
        } catch (error) {
            return { success: false, message: 'Server error. Please try again later.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('ecoMarketUser');
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
