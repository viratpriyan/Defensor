import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SHADOWS } from '../utils/constants';

const EmergencyButton = ({ onPress, isEmergencyActive }) => {
    return (
        <TouchableOpacity
            style={[styles.outerCircle, isEmergencyActive && styles.activeOuter]}
            onPress={onPress}
            activeOpacity={0.9}
        >
            <View style={[styles.innerCircle, isEmergencyActive && styles.activeInner]}>
                <Text style={styles.text}>{isEmergencyActive ? 'SOS\nACTIVE' : 'SOS'}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    outerCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: 'rgba(239, 68, 68, 0.1)', // Light transparent red
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeOuter: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
    },
    innerCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: '#EF4444', // Solid Red
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.soft,
        shadowColor: '#EF4444',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    activeInner: {
        backgroundColor: '#DC2626', // Deeper red when active
        transform: [{ scale: 1.05 }],
    },
    text: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '900',
        textAlign: 'center',
        letterSpacing: 1,
    }
});

export default EmergencyButton;
