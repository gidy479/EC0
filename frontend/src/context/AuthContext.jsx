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
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
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
