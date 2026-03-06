import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Share, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocation } from '../../hooks/useLocation';
import { getContacts, shareLocation } from '../../services/authService';
import { COLORS, SHADOWS, GRADIENTS } from '../../utils/constants';

const LiveTrackingScreen = ({ navigation }) => {
    const { location, isTracking, startTracking, stopTracking } = useLocation();
    const [guardians, setGuardians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastSharedTime, setLastSharedTime] = useState(null);
    const [routePath, setRoutePath] = useState([]);
    const sharingInterval = useRef(null);

    useEffect(() => {
        fetchGuardians();
        startTracking(); // Ensure tracking is active when we enter this screen

        // Initial share
        if (location) {
            handleInitialShare();
        }

        return () => {
            if (sharingInterval.current) clearInterval(sharingInterval.current);
        };
    }, []);

    useEffect(() => {
        if (location) {
            setRoutePath(prev => [...prev, { latitude: location.latitude, longitude: location.longitude }]);
        }
    }, [location]);

    // Set up periodic sharing (every 5 minutes)
    useEffect(() => {
        if (isTracking && location) {
            if (!sharingInterval.current) {
                sharingInterval.current = setInterval(() => {
                    performPeriodicShare();
                }, 5 * 60 * 1000);
            }
        } else {
            if (sharingInterval.current) {
                clearInterval(sharingInterval.current);
                sharingInterval.current = null;
            }
        }
    }, [isTracking, location]);

    const fetchGuardians = async () => {
        try {
            const res = await getContacts();
            if (res.success) {
                setGuardians(res.data);
            }
        } catch (error) {
            console.error("Failed to fetch guardians:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInitialShare = async () => {
        try {
            await shareLocation(location.latitude, location.longitude);
            setLastSharedTime(new Date().toLocaleTimeString());
        } catch (err) {
            console.error("Initial share failed:", err);
        }
    };

    const performPeriodicShare = async () => {
        if (location) {
            try {
                await shareLocation(location.latitude, location.longitude);
                setLastSharedTime(new Date().toLocaleTimeString());
                console.log("[LiveTracking] Periodic location update sent.");
            } catch (err) {
                console.error("[LiveTracking] Periodic share failed:", err);
            }
        }
    };

    const toggleTracking = () => {
        if (isTracking) {
            Alert.alert(
                "Stop Tracking?",
                "Guardians will no longer receive live updates.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Stop Tracking", onPress: () => {
                            stopTracking();
                            navigation.goBack();
                        }, style: "destructive"
                    }
                ]
            );
        } else {
            startTracking();
        }
    };

    const handleNativeShare = async () => {
        if (!location) return;
        try {
            const mapLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
            await Share.share({
                message: `Follow my journey live here: ${mapLink}`,
                url: mapLink,
                title: 'Live Tracking Link'
            });
        } catch (error) {
            console.error(error.message);
        }
    };

    return (
        <View style={styles.container}>
            {/* Map Header */}
            <View style={styles.mapHeader}>
                {location && (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                        }}
                    >
                        <Marker
                            coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                        >
                            <View style={styles.userMarker}>
                                <View style={styles.markerCircle} />
                            </View>
                        </Marker>
                        <Polyline
                            coordinates={routePath}
                            strokeWidth={5}
                            strokeColor={COLORS.primary}
                        />
                    </MapView>
                )}

                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    style={styles.statusBadgeWrapper}
                >
                    <View style={styles.statusBadge}>
                        <View style={[styles.pulse, { backgroundColor: isTracking ? COLORS.success : COLORS.warning }]} />
                        <Text style={styles.statusText}>{isTracking ? "LIVE" : "PAUSED"}</Text>
                    </View>
                </LinearGradient>
            </View>

            {/* Content Panel */}
            <View style={styles.panel}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View style={styles.dragHandle} />

                    <Text style={styles.sectionTitle}>Journey Statistics</Text>
                    <View style={styles.infoCard}>
                        <View style={styles.infoRow}>
                            <LinearGradient
                                colors={GRADIENTS.primary}
                                style={styles.iconBox}
                            >
                                <Icon name="clock-outline" size={20} color={COLORS.white} />
                            </LinearGradient>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>Active Since</Text>
                                <Text style={styles.infoValue}>{lastSharedTime || 'Initializing...'}</Text>
                            </View>
                        </View>
                        <View style={[styles.infoRow, { marginTop: 16 }]}>
                            <LinearGradient
                                colors={GRADIENTS.safety}
                                style={styles.iconBox}
                            >
                                <Icon name="shield-check-outline" size={20} color={COLORS.white} />
                            </LinearGradient>
                            <View style={styles.infoText}>
                                <Text style={styles.infoLabel}>Monitoring</Text>
                                <Text style={styles.infoValue}>Direct to Cloud Path</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.sectionTitle}>Monitoring Guardians</Text>
                    {loading ? (
                        <ActivityIndicator color={COLORS.primary} />
                    ) : guardians.length > 0 ? (
                        guardians.map((guardian, index) => (
                            <TouchableOpacity key={guardian.id || index} style={styles.guardianItem}>
                                <LinearGradient
                                    colors={GRADIENTS.dark}
                                    style={styles.guardianAvatar}
                                >
                                    <Text style={styles.avatarText}>{guardian.name[0]}</Text>
                                </LinearGradient>
                                <View style={styles.guardianInfo}>
                                    <Text style={styles.guardianName}>{guardian.name}</Text>
                                    <View style={styles.badgeRow}>
                                        <View style={styles.activeDot} />
                                        <Text style={styles.guardianStatus}>Connected Live</Text>
                                    </View>
                                </View>
                                <View style={styles.checkWrapper}>
                                    <Icon name="check-decagram" size={20} color={COLORS.success} />
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyCard}>
                            <Text style={styles.emptyText}>Alert more guardians from the menu.</Text>
                        </View>
                    )}
                </ScrollView>

                {/* Floating Bottom Actions */}
                <View style={styles.bottomActions}>
                    <TouchableOpacity
                        style={styles.shareBtnWrapper}
                        onPress={handleNativeShare}
                    >
                        <LinearGradient
                            colors={GRADIENTS.primary}
                            style={styles.shareBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            <Icon name="share-variant" size={22} color={COLORS.white} />
                            <Text style={styles.btnText}>Broadcast Link</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.stopBtn}
                        onPress={toggleTracking}
                    >
                        <Icon name="stop-circle" size={32} color={COLORS.danger} />
                    </TouchableOpacity>
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
    mapHeader: {
        height: '45%',
        width: '100%',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    userMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerCircle: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: COLORS.primary,
        borderWidth: 3,
        borderColor: COLORS.white,
    },
    statusBadgeWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 50,
        paddingBottom: 20,
        alignItems: 'center',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        ...SHADOWS.card,
    },
    pulse: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 10,
    },
    statusText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 2,
    },
    panel: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
        padding: 24,
        ...SHADOWS.card,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 24,
    },
    sectionTitle: {
        color: COLORS.darkSurface,
        fontSize: 18,
        fontWeight: '900',
        marginBottom: 16,
    },
    infoCard: {
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 24,
        ...SHADOWS.card,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    infoText: {
        flex: 1,
    },
    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        color: COLORS.darkSurface,
        fontSize: 16,
        fontWeight: '800',
        marginTop: 2,
    },
    guardianItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.background,
        padding: 16,
        borderRadius: 22,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    guardianAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        color: COLORS.white,
        fontWeight: '900',
        fontSize: 18,
    },
    guardianInfo: {
        flex: 1,
    },
    guardianName: {
        color: COLORS.darkSurface,
        fontWeight: '800',
        fontSize: 16,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.success,
        marginRight: 8,
    },
    guardianStatus: {
        color: COLORS.textSecondary,
        fontSize: 12,
        fontWeight: '600',
    },
    checkWrapper: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCard: {
        padding: 30,
        alignItems: 'center',
        backgroundColor: COLORS.background,
        borderRadius: 20,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    emptyText: {
        color: COLORS.textSecondary,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
    },
    bottomActions: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 40 : 30,
        left: 24,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
    },
    shareBtnWrapper: {
        flex: 1,
        marginRight: 16,
        ...SHADOWS.soft,
    },
    shareBtn: {
        flexDirection: 'row',
        height: 60,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stopBtn: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: COLORS.darkSurface,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.card,
    },
    btnText: {
        color: COLORS.white,
        fontWeight: '900',
        fontSize: 16,
        marginLeft: 12,
        letterSpacing: 0.5,
    }
});

export default LiveTrackingScreen;
