import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../utils/constants';

const OtpScreen = ({ route, navigation }) => {
    const { phone } = route.params;
    const [otp, setOtp] = useState('');
    const { login, isLoading } = useContext(AuthContext);

    const handleVerify = () => {
        if (otp.length === 4) {
            // Mock verify and login automatically
            login(phone, 'password'); // Bypass password requirement for mock OTP step
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Verify OTP</Text>
                <Text style={styles.subtitle}>Code sent to {phone}</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter 4-digit OTP"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="number-pad"
                    maxLength={4}
                    value={otp}
                    onChangeText={setOtp}
                    textAlign="center"
                />

                <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerify}
                    disabled={isLoading || otp.length < 4}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    formContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 40,
        textAlign: 'center',
    },
    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        borderRadius: 8,
        padding: 15,
        marginBottom: 20,
        fontSize: 24,
        letterSpacing: 8,
    },
    verifyButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    verifyButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OtpScreen;
