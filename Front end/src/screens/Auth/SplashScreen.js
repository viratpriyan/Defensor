import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { COLORS, ROUTES } from '../../utils/constants';

const SplashScreen = ({ navigation }) => {
    useEffect(() => {
        // Simulate a loading process (e.g., checking initial auth state or loading assets)
        const timer = setTimeout(() => {
            // Once "loaded", navigate to the Login screen
            navigation.replace(ROUTES.LOGIN);
        }, 2500); // 2.5 seconds splash

        return () => clearTimeout(timer);
    }, [navigation]);

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                {/* Ensure the generated logo exists at assets/defensor_logo.png */}
                <Image
                    source={require('../../../assets/defensor_logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.brandName}>Defensor</Text>
            <Text style={styles.tagline}>AI-Powered Safety Intelligence</Text>

            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={COLORS.safe} />
                <Text style={styles.loadingText}>Initializing systems...</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        width: 150,
        height: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 75,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: COLORS.safe,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    logo: {
        width: 100,
        height: 100,
    },
    brandName: {
        fontSize: 36,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 2,
        marginBottom: 5,
    },
    tagline: {
        fontSize: 14,
        color: COLORS.textSecondary,
        fontStyle: 'italic',
        letterSpacing: 1,
        marginBottom: 40,
    },
    loaderContainer: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.textSecondary,
        fontSize: 12,
    }
});

export default SplashScreen;
