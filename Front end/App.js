import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Firebase is initialized via src/config/firebase.js (web SDK)
// No native import needed - works with Expo Go

export default function App() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <AppNavigator />
            </AuthProvider>
        </SafeAreaProvider>
    );
}
