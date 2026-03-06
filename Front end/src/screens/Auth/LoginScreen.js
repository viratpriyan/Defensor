import { useContext, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, ROUTES } from '../../utils/constants';

const LoginScreen = ({ navigation }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { login, isLoading, error } = useContext(AuthContext);

    const handleLogin = async () => {
        setErrorMsg('');

        if (!phone || !password) {
            setErrorMsg('Please enter both phone and password.');
            return;
        }

        const phoneRegex = /^\d{10}$/;
        if (!phoneRegex.test(phone)) {
            setErrorMsg('Mobile number must be exactly 10 digits.');
            return;
        }

        await login(phone, password);
        if (error) {
            setErrorMsg(error);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <View style={styles.formContainer}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>Enter your details to monitor your safety.</Text>

                {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

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
                    placeholder="Password"
                    placeholderTextColor={COLORS.textSecondary}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate(ROUTES.REGISTER)}>
                    <Text style={styles.registerLink}>Don't have an account? <Text style={{ color: COLORS.primary }}>Register</Text></Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    formContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },
    title: { fontSize: 32, fontWeight: 'bold', color: COLORS.text, marginBottom: 10 },
    subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 30 },
    errorText: { color: COLORS.primary, fontSize: 14, marginBottom: 15, textAlign: 'center', fontWeight: 'bold' },
    input: { backgroundColor: COLORS.surface, color: COLORS.text, borderRadius: 8, padding: 15, marginBottom: 20, fontSize: 16, borderWidth: 1, borderColor: 'transparent' },
    loginButton: { backgroundColor: COLORS.primary, borderRadius: 8, padding: 15, alignItems: 'center', marginTop: 10 },
    loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    registerLink: { color: COLORS.textSecondary, textAlign: 'center', marginTop: 20, fontSize: 15 }
});

export default LoginScreen;
