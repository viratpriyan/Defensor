import * as Location from 'expo-location';

const MOCK_LOCATION = {
    // Defaulting to Coimbatore, Tamil Nadu for accurate local testing
    latitude: 11.0168,
    longitude: 76.9558,
    accuracy: 10,
};

export const getCurrentLocation = async () => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.warn("Location permission denied. Using mock.");
            return { ...MOCK_LOCATION, mocked: true };
        }

        let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
        });

        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            accuracy: location.coords.accuracy,
            mocked: false,
        };
    } catch (error) {
        console.error("Error getting location:", error);
        return { ...MOCK_LOCATION, mocked: true };
    }
};

export const startLocationTracking = async (callback) => {
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            return mockTracking(callback);
        }

        const subscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            },
            (location) => {
                callback({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    accuracy: location.coords.accuracy,
                });
            }
        );

        return () => subscription.remove();
    } catch (error) {
        console.error("Location tracking error:", error);
        return mockTracking(callback);
    }
};

const mockTracking = (callback) => {
    let { latitude, longitude } = MOCK_LOCATION;
    const interval = setInterval(() => {
        latitude += 0.0001;
        longitude += 0.0001;
        callback({ latitude, longitude });
    }, 5000);
    return () => clearInterval(interval);
};

