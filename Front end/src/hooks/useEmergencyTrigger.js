import { useState, useEffect, useRef } from 'react';
import { getCurrentLocation } from '../services/locationService';
import { triggerSOS, getContacts } from '../services/authService';
import { triggerEmergencyCall } from '../utils/helpers';

export const useEmergencyTrigger = () => {
    const [isEmergencyActive, setIsEmergencyActive] = useState(false);
    const primaryGuardianNumber = useRef(null);

    // Pre-fetch contacts when the hook is used (i.e. on App/Dashboard load)
    // This allows us to dial "without wasting a second" because the number is ready.
    useEffect(() => {
        const prefetchContacts = async () => {
            try {
                const res = await getContacts();
                if (res.success && res.data && res.data.length > 0) {
                    primaryGuardianNumber.current = res.data[0].phone;
                    console.log("[SOS] Pre-loaded emergency number:", primaryGuardianNumber.current);
                }
            } catch (err) {
                console.warn("[SOS] Failed to pre-load emergency contacts", err);
            }
        };

        prefetchContacts();
    }, []);

    const activateEmergency = async (providedLocation) => {
        if (isEmergencyActive) return;

        // 1. INSTANTLY Trigger Phone Call Dialer using pre-loaded number
        // Absolute priority: zero latency calling
        if (primaryGuardianNumber.current) {
            triggerEmergencyCall(primaryGuardianNumber.current);
        }

        setIsEmergencyActive(true);
        console.log("EMERGENCY ACTIVATED!");

        // 2. Fetch fresh location and notify backend in the background
        let finalLocation = providedLocation;

        if (!finalLocation) {
            console.log("[SOS] No location provided, attempting immediate fetch...");
            try {
                finalLocation = await getCurrentLocation();
            } catch (err) {
                console.warn("[SOS] Failed to fetch current location for SOS", err);
            }
        }

        // 3. Trigger SMS and Backend Logging
        if (finalLocation) {
            try {
                await triggerSOS(finalLocation.latitude, finalLocation.longitude);
                console.log("Automated SOS triggered via backend!");
            } catch (err) {
                console.error("Failed to trigger automated SOS via backend", err);
            }
        } else {
            console.error("[SOS] Emergency triggered but NO LOCATION could be found.");
            try {
                await triggerSOS(0, 0);
            } catch (e) {
                console.error("[SOS] Failed to log generic SOS event", e);
            }
        }

        // 4. Secondary Check: If we didn't have a number pre-loaded, try to fetch it now as a fallback
        if (!primaryGuardianNumber.current) {
            try {
                const res = await getContacts();
                if (res.success && res.data && res.data.length > 0) {
                    primaryGuardianNumber.current = res.data[0].phone;
                    triggerEmergencyCall(primaryGuardianNumber.current);
                }
            } catch (err) { }
        }
    };

    const stopEmergency = () => {
        setIsEmergencyActive(false);
        console.log("Emergency Mode Deactivated");
    };

    useEffect(() => {
        // Mock Scream/Voice Distress Detection
        const handleDetectionPlaceholders = () => { };

        const timer = setTimeout(() => {
            // handleDetectionPlaceholders(); 
        }, 60000);

        return () => clearTimeout(timer);
    }, [isEmergencyActive]);

    return { isEmergencyActive, activateEmergency, stopEmergency };
};
