import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker } from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocation } from '../../hooks/useLocation';
import { getSafeZones } from '../../services/authService';
import { COLORS, SHADOWS, GRADIENTS } from '../../utils/constants';

const SafeZonesScreen = () => {
    const { location } = useLocation();
    const [safeZones, setSafeZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        if (location) {
            fetchSafeZones();
        }
    }, [location]);

    const fetchSafeZones = async () => {
        try {
            setLoading(true);
            const res = await getSafeZones(location.latitude, location.longitude);
            if (res.success) {
                setSafeZones(res.data);
            }
        } catch (error) {
            console.error("Error fetching safe zones:", error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: 'All', icon: 'apps' },
        { name: 'Hospital', icon: 'hospital-building', type: 'hospital' },
        { name: 'Police', icon: 'shield-check', type: 'police' },
        { name: 'Pharmacy', icon: 'pill', type: 'pharmacy' },
        { name: 'Landmark', icon: 'map-marker-star', type: 'Landmark' }
    ];

    const filteredZones = filter === 'All'
        ? safeZones
        : safeZones.filter(z => z.type.toLowerCase().includes(filter.toLowerCase()));

    const handleOpenMap = (lat, lon) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        Linking.openURL(url);
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.cardWrapper}
            onPress={() => handleOpenMap(item.latitude, item.longitude)}
        >
            <View style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: item.type.includes('police') ? 'rgba(99, 102, 241, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                    <Icon
                        name={item.type.includes('police') ? 'shield-check' : item.type.includes('hospital') ? 'hospital-building' : 'map-marker'}
                        size={22}
                        color={item.type.includes('police') ? COLORS.primary : COLORS.danger}
                    />
                </View>
                <View style={styles.cardBody}>
                    <Text style={styles.zoneName} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.detailsRow}>
                        <View style={styles.badge}>
                            <Text style={styles.zoneType}>{item.type.toUpperCase()}</Text>
                        </View>
                        <View style={styles.addressBox}>
                            <Icon name="map-marker-outline" size={14} color={COLORS.textSecondary} />
                            <Text style={styles.zoneAddress} numberOfLines={1}>{item.address}</Text>
                        </View>
                    </View>
                </View>
                <Icon name="chevron-right" size={20} color={COLORS.textSecondary} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.mapHeader}>
                {location && (
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        }}
                    >
                        <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }}>
                            <View style={styles.userMarker}>
                                <View style={styles.markerInner} />
                            </View>
                        </Marker>
                        {filteredZones.map(zone => (
                            <Marker
                                key={zone.id}
                                coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
                                title={zone.name}
                            >
                                <View style={[styles.customMarker, { backgroundColor: zone.type.includes('police') ? COLORS.primary : zone.type.includes('hospital') ? COLORS.danger : COLORS.success }]}>
                                    <Icon
                                        name={zone.type.includes('police') ? 'shield-check' : zone.type.includes('hospital') ? 'hospital-building' : 'map-marker'}
                                        size={14}
                                        color="#fff"
                                    />
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                )}
            </View>

            <View style={styles.contentPanel}>
                <View style={styles.dragHandle} />
                <View style={styles.filterBar}>
                    <FlatList
                        data={categories}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.name}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => setFilter(item.name)}
                                style={styles.filterBtnWrapper}
                            >
                                <LinearGradient
                                    colors={filter === item.name ? GRADIENTS.primary : ['#F1F5F9', '#F1F5F9']}
                                    style={styles.filterBtn}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                >
                                    <Icon name={item.icon} size={18} color={filter === item.name ? '#fff' : COLORS.textSecondary} />
                                    <Text style={[styles.filterText, filter === item.name && styles.activeFilterText]}>
                                        {item.name}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {loading ? (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                        <Text style={styles.loadingText}>Locating Nearby Safety Havens...</Text>
                    </View>
                ) : filteredZones.length > 0 ? (
                    <FlatList
                        data={filteredZones}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <View style={styles.emptyContainer}>
                        <Icon name="map-marker-off" size={64} color={COLORS.border} />
                        <Text style={styles.emptyText}>No protected zones identified.</Text>
                    </View>
                )}
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
        height: '40%',
        width: '100%',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    userMarker: {
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    markerInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: '#fff',
    },
    customMarker: {
        padding: 6,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',
        ...SHADOWS.card,
    },
    contentPanel: {
        flex: 1,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: -40,
        paddingTop: 12,
        ...SHADOWS.card,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    filterBar: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    filterBtnWrapper: {
        marginRight: 12,
        ...SHADOWS.card,
    },
    filterBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 18,
    },
    filterText: {
        color: COLORS.textSecondary,
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '700',
    },
    activeFilterText: {
        color: '#fff',
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 30,
    },
    cardWrapper: {
        marginBottom: 12,
        ...SHADOWS.card,
    },
    card: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.8)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardBody: {
        flex: 1,
    },
    zoneName: {
        color: COLORS.darkSurface,
        fontSize: 16,
        fontWeight: '900',
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    badge: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        marginRight: 12,
    },
    zoneType: {
        color: COLORS.textSecondary,
        fontSize: 9,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    zoneAddress: {
        color: COLORS.textSecondary,
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: 12,
        fontSize: 14,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 60,
    },
    emptyText: {
        color: COLORS.textSecondary,
        marginTop: 12,
        fontSize: 14,
        fontWeight: '600',
    }
});

export default SafeZonesScreen;
