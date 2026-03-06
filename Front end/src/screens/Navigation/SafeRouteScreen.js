import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import MapViewComponent from '../../components/MapViewComponent';
import RouteSafetyIndicator from '../../components/RouteSafetyIndicator';
import { useLocation } from '../../hooks/useLocation';
import { getSafeRoute } from '../../services/mapService';
import { COLORS, SHADOWS, GRADIENTS } from '../../utils/constants';

const SafeRouteScreen = ({ navigation }) => {
    const { location } = useLocation();
    const [destinationStr, setDestinationStr] = useState('');
    const [allRoutes, setAllRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [destinationCoord, setDestinationCoord] = useState(null);

    const handleSearchRoute = async () => {
        if (!destinationStr || !location) return;

        setIsLoading(true);

        try {
            const routes = await getSafeRoute(location, destinationStr);
            setAllRoutes(routes);

            const safest = routes.find(r => r.safetyScore === 'Safe') || routes[0];
            setSelectedRoute(safest);

            if (safest && safest.destinationCoords) {
                setDestinationCoord(safest.destinationCoords);
            }

        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwitchRoute = (route) => {
        setSelectedRoute(route);
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
        >
            <View style={styles.mapContainer}>
                <MapViewComponent
                    location={location}
                    destination={destinationCoord}
                    allRoutes={allRoutes}
                    selectedRouteId={selectedRoute?.routeId}
                />
            </View>

            <View style={styles.panel}>
                <View style={styles.dragHandle} />
                <Text style={styles.title}>Dynamic Navigation</Text>

                <View style={[styles.searchBox, isLoading && { borderColor: COLORS.primary }]}>
                    <Icon name="search" size={20} color={COLORS.primary} />
                    <TextInput
                        style={styles.input}
                        placeholder="Define your destination"
                        placeholderTextColor={COLORS.textSecondary}
                        value={destinationStr}
                        onChangeText={setDestinationStr}
                        onSubmitEditing={handleSearchRoute}
                    />
                    {isLoading ? (
                        <ActivityIndicator color={COLORS.primary} size="small" />
                    ) : (
                        destinationStr.length > 0 && (
                            <TouchableOpacity onPress={handleSearchRoute}>
                                <LinearGradient
                                    colors={GRADIENTS.primary}
                                    style={styles.searchBtn}
                                >
                                    <Icon name="arrow-right" size={18} color={COLORS.white} />
                                </LinearGradient>
                            </TouchableOpacity>
                        )
                    )}
                </View>

                {selectedRoute && (
                    <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
                        <RouteSafetyIndicator score={selectedRoute.safetyScore} />

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routePicker}>
                            {allRoutes.map((route) => (
                                <TouchableOpacity
                                    key={route.routeId}
                                    onPress={() => handleSwitchRoute(route)}
                                    style={styles.routeOptionWrapper}
                                >
                                    <LinearGradient
                                        colors={selectedRoute.routeId === route.routeId ? GRADIENTS.primary : ['#F1F5F9', '#F1F5F9']}
                                        style={styles.routeOption}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                    >
                                        <View style={[
                                            styles.scoreDot,
                                            { backgroundColor: route.safetyScore === 'Safe' ? COLORS.success : (route.safetyScore === 'Moderate' ? COLORS.warning : COLORS.danger) }
                                        ]} />
                                        <Text style={[
                                            styles.routeOptionName,
                                            selectedRoute.routeId === route.routeId && { color: COLORS.white }
                                        ]}>{route.name}</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.infoCard}>
                            <View style={styles.infoItem}>
                                <LinearGradient colors={GRADIENTS.secondary} style={styles.iconBox}>
                                    <Icon name="clock" size={18} color={COLORS.white} />
                                </LinearGradient>
                                <View>
                                    <Text style={styles.infoLabel}>ETA</Text>
                                    <Text style={styles.infoValue}>{selectedRoute.estimatedTime}</Text>
                                </View>
                            </View>

                            <View style={styles.infoItem}>
                                <LinearGradient colors={GRADIENTS.safety} style={styles.iconBox}>
                                    <Icon name="activity" size={18} color={COLORS.white} />
                                </LinearGradient>
                                <View>
                                    <Text style={styles.infoLabel}>Traffic</Text>
                                    <Text style={styles.infoValue}>{selectedRoute.trafficLevel}</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.startBtnWrapper}>
                            <LinearGradient
                                colors={GRADIENTS.primary}
                                style={styles.startBtn}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.startBtnText}>Initiate Live Navigation</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                )}
            </View>
        </KeyboardAvoidingView>
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
    panel: {
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        padding: 24,
        paddingTop: 12,
        maxHeight: '55%',
        ...SHADOWS.card,
        marginTop: -40,
    },
    dragHandle: {
        width: 40,
        height: 4,
        backgroundColor: COLORS.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '900',
        color: COLORS.darkSurface,
        marginBottom: 20,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: 22,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        height: 60,
    },
    input: {
        flex: 1,
        color: COLORS.darkSurface,
        paddingHorizontal: 12,
        fontSize: 16,
        fontWeight: '600',
    },
    searchBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.card,
    },
    resultsContainer: {
        marginTop: 20,
    },
    infoCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: 28,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginTop: 10,
        ...SHADOWS.card,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    infoValue: {
        color: COLORS.darkSurface,
        fontSize: 14,
        fontWeight: '900',
    },
    routePicker: {
        marginVertical: 18,
    },
    routeOptionWrapper: {
        marginRight: 10,
        ...SHADOWS.card,
    },
    routeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 18,
    },
    scoreDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    routeOptionName: {
        color: COLORS.text,
        fontSize: 14,
        fontWeight: '800',
    },
    startBtnWrapper: {
        marginTop: 24,
        ...SHADOWS.soft,
    },
    startBtn: {
        padding: 20,
        borderRadius: 22,
        alignItems: 'center',
    },
    startBtnText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 1,
    }
});

export default SafeRouteScreen;
