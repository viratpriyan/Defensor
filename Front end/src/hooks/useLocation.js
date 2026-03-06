import { useEffect, useState } from 'react';
import { getCurrentLocation, startLocationTracking } from '../services/locationService';

export const useLocation = () => {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [trackRef, setTrackRef] = useState(null);

    useEffect(() => {
        let unmountObj = null;

        const fetchLocation = async () => {
            try {
                const loc = await getCurrentLocation();
                setLocation(loc);

                // Start tracking
                const stopTracking = await startLocationTracking((newLoc) => {
                    setLocation((prev) => ({ ...prev, ...newLoc }));
                });
                unmountObj = stopTracking;
            } catch (err) {
                setErrorMsg('Error getting location');
            }
        };

        fetchLocation();

        return () => {
            if (unmountObj) unmountObj();
        };
    }, []);

    const startTracking = async () => {
        if (isTracking) return;
        setIsTracking(true);
        console.log("Live Location Sharing Started");
        const stop = await startLocationTracking((newLoc) => {
            setLocation((prev) => ({ ...prev, ...newLoc }));
        });
        setTrackRef(() => stop);
    };

    const stopTracking = () => {
        if (trackRef) {
            trackRef();
            setTrackRef(null);
        }
        setIsTracking(false);
        console.log("Live Location Sharing Stopped");
    };

    return { location, errorMsg, isTracking, startTracking, stopTracking };
};
