import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import EmergencyButton from '../../components/EmergencyButton';
import MapViewComponent from '../../components/MapViewComponent';
import { useEmergencyTrigger } from '../../hooks/useEmergencyTrigger';
import { useLocation } from '../../hooks/useLocation';
import { getSafeZones, shareLocation } from '../../services/authService';
import { COLORS, ROUTES, SHADOWS, GRADIENTS } from '../../utils/constants';

const DashboardScreen = ({ navigation }) => {
    const { location, isTracking } = useLocation();
    const { isEmergencyActive, activateEmergency, stopEmergency } = useEmergencyTrigger();
    const [safeZones, setSafeZones] = useState([]);

    useEffect(() => {
        if (location) {
            getSafeZones(location.latitude, location.longitude).then(res => {
                if (res.success) setSafeZones(res.data);
            });
        }
    }, [location]);

    const handleSosPress = () => {
        if (isEmergencyActive) {
            stopEmergency();
        } else {
            activateEmergency(location);
            navigation.navigate(ROUTES.EMERGENCY, { screen: ROUTES.SOS });
        }
    };

    const handleShareTracker = () => {
        if (location) {
            shareLocation(location.latitude, location.longitude);
        }
        navigation.navigate(ROUTES.LIVE_TRACKING);
    };

    const handleNativeShare = async () => {
        if (!location) return;
        try {
            const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
            await Share.share({
                message: `I'm using the Women Safety App. My current location is: ${mapLink}`,
                url: mapLink,
                title: 'My Current Location'
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Map Background */}
            <View style={styles.mapContainer}>
                <MapViewComponent
                    location={location}
                    safeZones={safeZones}
                />

                <LinearGradient
                    colors={['rgba(248, 250, 252, 0)', 'rgba(248, 250, 252, 1)']}
                    style={styles.mapOverlay}
                />

                {/* Floating Share Button */}
                <TouchableOpacity
                    style={styles.floatingShareBtn}
                    onPress={handleNativeShare}
                >
                    <Icon name="share-2" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Premium Action Buttons Panel */}
            <View style={styles.bottomPanel}>
                <View style={styles.actionRow}>
                    <TouchableOpacity
                        style={styles.cardWrapper}
                        onPress={() => navigation.navigate(ROUTES.NAVIGATION, { screen: ROUTES.SAFE_ROUTE })}
                    >
                        <LinearGradient
                            colors={GRADIENTS.safety}
                            style={styles.dashboardCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardIconBox}>
                                <Icon name="navigation" size={24} color="#fff" />
                            </View>
                            <Text style={styles.cardTitle}>Safe Journey</Text>
                            <Text style={styles.cardSubtitle}>AI Navigation</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cardWrapper}
                        onPress={handleShareTracker}
                    >
                        <LinearGradient
                            colors={isTracking ? GRADIENTS.secondary : GRADIENTS.primary}
                            style={styles.dashboardCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardIconBox}>
                                <Icon name={isTracking ? "activity" : "share-2"} size={24} color="#fff" />
                            </View>
                            <Text style={styles.cardTitle}>{isTracking ? "Tracking" : "Share Tracker"}</Text>
                            <Text style={styles.cardSubtitle}>{isTracking ? "Active Now" : "Send Location"}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={[styles.actionRow, { marginTop: 15 }]}>
                    <TouchableOpacity
                        style={styles.cardWrapper}
                        onPress={() => navigation.navigate(ROUTES.EMERGENCY, { screen: ROUTES.CONTACTS })}
                    >
                        <LinearGradient
                            colors={GRADIENTS.dark}
                            style={styles.dashboardCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardIconBox}>
                                <Icon name="users" size={24} color="#fff" />
                            </View>
                            <Text style={styles.cardTitle}>Guardians</Text>
                            <Text style={styles.cardSubtitle}>Manage Core List</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.cardWrapper}
                        onPress={() => navigation.navigate(ROUTES.EMERGENCY, { screen: ROUTES.SAFE_ZONES })}
                    >
                        <LinearGradient
                            colors={GRADIENTS.secondary}
                            style={styles.dashboardCard}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.cardIconBox}>
                                <Icon name="map-pin" size={24} color="#fff" />
                            </View>
                            <Text style={styles.cardTitle}>Safe Zones</Text>
                            <Text style={styles.cardSubtitle}>Nearby Rescue</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* SOS Button Center Overlap */}
                <View style={styles.sosContainer}>
                    <EmergencyButton
                        isEmergencyActive={isEmergencyActive}
                        onPress={handleSosPress}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mapContainer: {
        flex: 1,
    },
    mapOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 100,
    },
    floatingShareBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: COLORS.darkSurface,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.card,
    },
    bottomPanel: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        paddingTop: 75,
        paddingBottom: Platform.OS === 'ios' ? 40 : 30,
        ...SHADOWS.card,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    actionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
        borderRadius: 28,
        ...SHADOWS.card,
    },
    dashboardCard: {
        padding: 20,
        borderRadius: 28,
        height: 160,
        justifyContent: 'space-between',
    },
    cardIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '900',
        marginTop: 10,
    },
    cardSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 12,
        fontWeight: '600',
    },
    sosContainer: {
        position: 'absolute',
        top: -55,
        alignSelf: 'center',
        zIndex: 10,
    },
});

export default DashboardScreen;
