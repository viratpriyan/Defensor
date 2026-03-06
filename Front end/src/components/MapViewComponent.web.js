import { StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../utils/constants';

const MapViewComponent = ({ location, destination, destinationString, routeCoordinates, safeZones }) => {
    // If no location, show a placeholder with background
    if (!location) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: COLORS.textSecondary }}>Waiting for location...</Text>
            </View>
        );
    }

    // Google Maps Embed URL
    // daddr = Destination Address, saddr = Source Address
    // dirflg = Directions Flag. 'h' = avoid highways (simulates shortcut/local), 't' = avoid tolls (simulates standard/fastest)

    let dirflg = '';
    if (routeCoordinates && routeCoordinates.length > 0) {
        // Now using the explicit 'type' property our ML simulation injected into the polyline array hack
        const routeType = routeCoordinates[0];
        if (routeType === 'fastest') {
            dirflg = 't'; // Fastest (Avoid tolls if possible, defaults to fastest)
        } else if (routeType === 'shortcut') {
            // Use 'w' (walking) or 'r' (transit) or 'h' (avoid highways) to force a vastly different looking route for the "shortcut"/alternative demo
            dirflg = 'w';
        } else {
            // 'safest' or default usually has no flag to let google pick the balanced best route (usually driving, 'd')
            dirflg = 'd';
        }
    }

    // Prefer destinationString explicitly to draw accurate routes on the web iframe even without an API key
    const destQuery = destinationString ? encodeURIComponent(destinationString) : (destination ? `${destination.latitude},${destination.longitude}` : '');

    const mapUrl = destQuery
        ? `https://maps.google.com/maps?saddr=${location.latitude},${location.longitude}&daddr=${destQuery}&dirflg=${dirflg}&output=embed&t=m`
        : `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=14&output=embed&t=m`;

    return (
        <View style={styles.container}>
            {/* Using a standard iframe for absolute compatibility on web without API key */}
            <iframe
                title="Google Map"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{
                    border: 0,
                    filter: 'invert(90%) hue-rotate(180deg)', // Mock Dark Mode for Google Maps
                    opacity: 0.8
                }}
                src={mapUrl}
                allowFullScreen
            />

            {/* Overlay for Safe Zones if active */}
            {safeZones && safeZones.length > 0 && (
                <View style={styles.overlay}>
                    <View style={styles.safeZoneBadge}>
                        <Text style={styles.safeZoneText}>{safeZones.length} Safe Zones Visible</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.background,
    },
    overlay: {
        position: 'absolute',
        top: 100,
        right: 20,
        zIndex: 10,
    },
    safeZoneBadge: {
        backgroundColor: COLORS.safe,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    safeZoneText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    }
});

export default MapViewComponent;
