import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // On app start, restore saved user session
    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const userData = await AsyncStorage.getItem('userData');
                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (e) {
                console.log('Session restore error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        restoreSession();
    }, []);

    // ── Login ──────────────────────────────────────────────
    const login = async (phone, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await loginUser(phone, password);
            if (response.success) {
                const userData = { ...response.data, hasCompletedOnboarding: true };
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                setUser(userData);
            } else {
                setError(response.message || 'Login failed');
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Network error. Check your connection.';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Register ───────────────────────────────────────────
    const register = async (details) => {
        setIsLoading(true);
        setError(null);
        try {
            const { name, email, phone, password } = details;
            const response = await registerUser(name, email, phone, password);
            if (response.success) {
                const userData = { ...response.data, hasCompletedOnboarding: false };
                await AsyncStorage.setItem('authToken', response.data.token);
                await AsyncStorage.setItem('userData', JSON.stringify(userData));
                setUser(userData);
                return true;
            } else {
                setError(response.message || 'Registration failed');
                return false;
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Network error. Check your connection.';
            setError(msg);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    // ── Complete Onboarding ────────────────────────────────
    const completeOnboarding = async (contacts) => {
        const updatedUser = { ...user, hasCompletedOnboarding: true, emergencyContacts: contacts };
        setUser(updatedUser);
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    };

    // ── Logout ─────────────────────────────────────────────
    const logout = async () => {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('userData');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, register, logout, setUser, completeOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
};
