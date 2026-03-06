import { Alert, Linking } from 'react-native';

export const calculateSafetyScore = (routeData) => {
    // Mock logic to calculate safety score based on route data
    const randomNumber = Math.random();
    if (randomNumber > 0.6) return 'Safe';
    if (randomNumber > 0.3) return 'Moderate';
    return 'Risky';
};

export const triggerEmergencyCall = (phoneNumber) => {
    if (!phoneNumber) return;
    Linking.openURL(`tel:${phoneNumber}`).catch((err) =>
        console.error('[SOS] Failed to open dialer:', err)
    );
};

export const getBusTimings = (routeId) => {
    return [
        { type: 'Bus 104', arrival: '5 mins', crowd: 'Low' },
        { type: 'Bus 20', arrival: '15 mins', crowd: 'Medium' },
    ];
};
