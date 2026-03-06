import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../utils/constants';

const MapViewComponent = ({ location, destination, allRoutes = [], selectedRouteId, safeZones }) => {
    const mapRef = useRef(null);

    useEffect(() => {
        if (mapRef.current && allRoutes.length > 0) {
            // Flatten all coordinates to fit them all on screen so alternatives are visible
            const allCoords = allRoutes.flatMap(r => r.polyline);

            if (allCoords.length > 0) {
                mapRef.current.fitToCoordinates(allCoords, {
                    edgePadding: { top: 80, right: 50, bottom: 250, left: 50 }, // More bottom padding for UI panel
                    animated: true,
                });
            }
        } else if (mapRef.current && location && destination) {
            mapRef.current.fitToCoordinates([location, destination], {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
            });
        }
    }, [allRoutes, selectedRouteId, location, destination]);

    if (!location) return <View style={styles.map} />;

    return (
        <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }}
            provider="google"
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsTraffic={true}
            userInterfaceStyle="dark"
        >
            <Marker
                coordinate={location}
                title="Current Location"
                description="You are here"
                pinColor={COLORS.blue || '#0A84FF'}
            />
            {destination && (
                <Marker
                    coordinate={destination}
                    title="Destination"
                    pinColor={COLORS.danger || '#FF3B30'}
                />
            )}
            {allRoutes.map((route) => {
                const isSelected = !selectedRouteId || route.routeId === selectedRouteId;

                let solidColor = '#34C759'; // Green
                let fadedColor = 'rgba(52, 199, 89, 0.35)'; // Faded Green

                if (route.safetyScore === 'Safe') {
                    solidColor = '#34C759';
                    fadedColor = 'rgba(52, 199, 89, 0.35)';
                } else if (route.safetyScore === 'Moderate') {
                    solidColor = '#FF9500';
                    fadedColor = 'rgba(255, 149, 0, 0.35)';
                } else if (route.safetyScore === 'Risky') {
                    solidColor = '#FF3B30';
                    fadedColor = 'rgba(255, 59, 48, 0.35)';
                }

                return (
                    <Polyline
                        key={route.routeId}
                        coordinates={route.polyline}
                        strokeColor={isSelected ? solidColor : fadedColor}
                        strokeWidth={6}
                        zIndex={isSelected ? 100 : 10}
                    />
                );
            })}
            {safeZones && safeZones.map(zone => (
                <Marker
                    key={zone.id}
                    coordinate={{ latitude: zone.latitude, longitude: zone.longitude }}
                    title={zone.name}
                    description={zone.type}
                    pinColor={zone.type === 'Police' ? COLORS.secondary : COLORS.safe}
                >
                    <Icon name={zone.type === 'Police' ? 'shield' : 'plus-square'} size={24} color={zone.type === 'Police' ? COLORS.secondary : COLORS.safe} />
                </Marker>
            ))}
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default MapViewComponent;

