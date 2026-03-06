import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';

// Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import OnboardingContactsScreen from '../screens/Auth/OnboardingContactsScreen';
import OtpScreen from '../screens/Auth/OtpScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import SplashScreen from '../screens/Auth/SplashScreen';
import EmergencyContactsScreen from '../screens/Emergency/EmergencyContactsScreen';
import SafeZonesScreen from '../screens/Emergency/SafeZonesScreen';
import SosScreen from '../screens/Emergency/SosScreen';
import DashboardScreen from '../screens/Home/DashboardScreen';
import LiveTrackingScreen from '../screens/Home/LiveTrackingScreen';
import SafeRouteScreen from '../screens/Navigation/SafeRouteScreen';

import CustomHeader from '../components/CustomHeader';
import ProfileScreen from '../screens/Settings/ProfileScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const EmergencyStack = createNativeStackNavigator();

const AuthNavigator = () => (
    <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName={ROUTES.SPLASH}>
        <AuthStack.Screen name={ROUTES.SPLASH} component={SplashScreen} />
        <AuthStack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
        <AuthStack.Screen name={ROUTES.REGISTER} component={RegisterScreen} />
        <AuthStack.Screen name={ROUTES.OTP} component={OtpScreen} />
    </AuthStack.Navigator>
);

const AppNavigator = () => {
    const { user } = useContext(AuthContext);

    return (
        <NavigationContainer>
            {/* The root stack handles switching between Auth vs Main App */}
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    user.hasCompletedOnboarding === false ? (
                        <Stack.Screen name="Onboarding" children={() => (
                            <AuthStack.Navigator screenOptions={{ headerShown: false }}>
                                <AuthStack.Screen name="OnboardingContacts" component={OnboardingContactsScreen} />
                            </AuthStack.Navigator>
                        )} />
                    ) : (
                        // This fragment represents the main authenticated app where we WANT the CustomHeader
                        <Stack.Screen name="MainApp" options={{ headerShown: false }}>
                            {() => (
                                <HomeStack.Navigator
                                    screenOptions={{
                                        header: () => <CustomHeader />,
                                        headerShown: true
                                    }}
                                >
                                    <HomeStack.Screen name={ROUTES.HOME} component={DashboardScreen} />
                                    <HomeStack.Screen name={ROUTES.LIVE_TRACKING} component={LiveTrackingScreen} />
                                    <HomeStack.Screen name={ROUTES.NAVIGATION} component={SafeRouteScreen} />
                                    <HomeStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
                                    <HomeStack.Screen name={ROUTES.EMERGENCY} children={() => (
                                        <EmergencyStack.Navigator screenOptions={{ headerShown: false }}>
                                            <EmergencyStack.Screen name={ROUTES.SOS} component={SosScreen} />
                                            <EmergencyStack.Screen name={ROUTES.CONTACTS} component={EmergencyContactsScreen} />
                                            <EmergencyStack.Screen name={ROUTES.SAFE_ZONES} component={SafeZonesScreen} />
                                        </EmergencyStack.Navigator>
                                    )} />
                                </HomeStack.Navigator>
                            )}
                        </Stack.Screen>
                    )
                ) : (
                    <Stack.Screen name={ROUTES.AUTH} component={AuthNavigator} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
