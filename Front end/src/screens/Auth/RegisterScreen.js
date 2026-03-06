import { useContext, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, ROUTES } from '../../utils/constants';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { register, isLoading, error } = useContext(AuthContext);

    const handleRegister = async () => {
        setErrorMsg('');

        if (!name || !email || !phone || !password) {
            setErrorMsg('Please fill in all fields.');
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setErrorMsg('Mobile number must be exactly 10 digits.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMsg('Please enter a valid email address.');
            return;
        }

        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.');
            return;
        }

        const success = await register({ name, email, phone, password });
        if (success) {
            navigation.navigate(ROUTES.OTP, { phone });
        } else {
            setErrorMsg(error || 'Registration failed. Try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Sign up to empower your safety.</Text>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={COLORS.textSecondary}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email Address"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Phone Number (10 digits)"
                    placeholderTextColor={COLORS.textSecondary}
                    keyboardType="phone-pad"
                    maxLength={10}
                    value={phone}
                    onChangeText={setPhone}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password (min 6 characters)"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.registerButton}
                    onPress={handleRegister}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.registerButtonText}>Register</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.loginLink}>Already have an account? <Text style={{ color: COLORS.primary }}>Login</Text></Text>
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
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        marginBottom: 30,
    },
    errorText: {
        color: COLORS.primary,
        fontSize: 14,
        marginBottom: 15,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    registerButton: {
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    registerButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginLink: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginTop: 20,
        fontSize: 15,
    }
});

export default RegisterScreen;
