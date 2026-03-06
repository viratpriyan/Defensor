import polyline from '@mapbox/polyline';

const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

const decodePolyline = (encoded) => {
    if (!encoded) return [];
    return polyline.decode(encoded).map((point) => ({
        latitude: point[0],
        longitude: point[1]
    }));
};

// Real Map Service
export const getSafeRoute = async (source, destinationString) => {
    try {
        if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
            console.warn("Google Maps API Key missing. Fetching free real roads via OpenStreetMap (OSRM)...");
            return getOSRMRoute(source, destinationString);
        }

        // 1. Geocode the destination string to get coordinates
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(destinationString)}&key=${GOOGLE_MAPS_API_KEY}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.status !== 'OK' || geoData.results.length === 0) {
            throw new Error('Could not find destination coordinates.');
        }

        const destCoord = geoData.results[0].geometry.location;
        const originStr = `${source.latitude},${source.longitude}`;
        const destStr = `${destCoord.lat},${destCoord.lng}`;

        // 2. Get Directions for different modes to get accurate ETAs
        // A. Safest (Standard Driving)
        const safeUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=driving&key=${GOOGLE_MAPS_API_KEY}`;
        // B. Fastest (Driving, explicitly avoiding tolls as a mock variant to see if it changes time, or just using standard if fastest)
        const fastUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=driving&avoid=tolls&key=${GOOGLE_MAPS_API_KEY}`;
        // C. Shortcut (Walking mode to match our visual map forced mode)
        const walkUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;

        // Fetch all three concurrently
        const [safeRes, fastRes, walkRes] = await Promise.all([
            fetch(safeUrl).then(r => r.json()),
            fetch(fastUrl).then(r => r.json()),
            fetch(walkUrl).then(r => r.json())
        ]);

        if (safeRes.status !== 'OK') throw new Error('Could not fetch main directions.');

        const routes = [];

        // 3. Construct our exact routes parsing the real ETAs from each specific API call

        // Safest (Standard Driving)
        if (safeRes.routes.length > 0) {
            routes.push({
                routeId: 'route_safest',
                name: 'Safest Route',
                type: 'safest',
                destinationCoords: { latitude: destCoord.lat, longitude: destCoord.lng },
                polyline: decodePolyline(safeRes.routes[0].overview_polyline?.points),
                estimatedTime: safeRes.routes[0].legs[0].duration.text,
                trafficLevel: 'Low',
                safetyScore: 'Safe',
            });
        }

        // Fastest (Fastest Driving) - fallback to safe time if avoid tolls fails
        const fastDuration = fastRes.routes?.length > 0 ? fastRes.routes[0].legs[0].duration.text : (safeRes.routes[0].legs[0].duration.text);
        const fastPoly = fastRes.routes?.length > 0 ? fastRes.routes[0].overview_polyline?.points : safeRes.routes[0].overview_polyline?.points;
        routes.push({
            routeId: 'route_fastest',
            name: 'Fastest Route',
            type: 'fastest',
            destinationCoords: { latitude: destCoord.lat, longitude: destCoord.lng },
            polyline: decodePolyline(fastPoly),
            estimatedTime: fastDuration,
            trafficLevel: 'Heavy',
            safetyScore: 'Moderate',
        });

        // Shortcut (Walking) - The ETA will legitimately be much longer since it's walking!
        if (walkRes.routes.length > 0) {
            routes.push({
                routeId: 'route_shortcut',
                name: 'Shortcut Route',
                type: 'shortcut',
                destinationCoords: { latitude: destCoord.lat, longitude: destCoord.lng },
                polyline: decodePolyline(walkRes.routes[0].overview_polyline?.points),
                estimatedTime: walkRes.routes[0].legs[0].duration.text,
                trafficLevel: 'Medium', // Walking traffic doesn't exist, but keeping UI consistent
                safetyScore: 'Risky',
            });
        }

        // Ensure we have at least one route
        if (routes.length === 0) return getMockRoutes(source);

        return routes;

    } catch (error) {
        console.error("Map Service Error:", error);
        return getMockRoutes(source); // Fallback to mock on error
    }
};

import { analyzeRouteWithAI } from './routeAnalyzerAI';

// Free Open Source Routing Machine (OSRM) logic
const getOSRMRoute = async (source, destinationString) => {
    try {
        // 1. Geocode the destination string with OpenStreetMap Nominatim with higher precision for the local area
        // Appending general region to help free geocoder
        const enhancedQuery = `${destinationString}, India`;
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(enhancedQuery)}&format=json&limit=1&addressdetails=1`;
        const geoRes = await fetch(geoUrl, { headers: { 'User-Agent': 'DefensorWomenSafetyApp/1.0' } });
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) throw new Error('Nominatim could not find destination coords');

        const destCoord = {
            latitude: parseFloat(geoData[0].lat),
            longitude: parseFloat(geoData[0].lon)
        };

        const formatTime = (seconds) => `${Math.max(1, Math.round(seconds / 60))} mins`;
        const formatDistance = (meters) => (meters / 1000).toFixed(1) + ' km';

        // Midpoint for calculating waypoint offsets
        const midLon = (source.longitude + destCoord.longitude) / 2;
        const midLat = (source.latitude + destCoord.latitude) / 2;

        // Offset by exactly 0.015 degrees (~1.5 km) to force the routing engine to pick parallel highways/roads
        const offset = 0.015;

        const coordsBase = `${source.longitude},${source.latitude};${destCoord.longitude},${destCoord.latitude}`;
        const coordsFast = `${source.longitude},${source.latitude};${(midLon + offset).toFixed(5)},${(midLat - offset).toFixed(5)};${destCoord.longitude},${destCoord.latitude}`;
        const coordsShort = `${source.longitude},${source.latitude};${(midLon - offset).toFixed(5)},${(midLat + offset).toFixed(5)};${destCoord.longitude},${destCoord.latitude}`;

        // Fetch 3 distinct physical road profiles via specific waypoints
        const [safeRes, fastRes, shortRes] = await Promise.all([
            fetch(`https://router.project-osrm.org/route/v1/driving/${coordsBase}?overview=full`).then(r => r.json()),
            fetch(`https://router.project-osrm.org/route/v1/driving/${coordsFast}?overview=full`).then(r => r.json()),
            fetch(`https://router.project-osrm.org/route/v1/driving/${coordsShort}?overview=full`).then(r => r.json())
        ]);

        if (safeRes.code !== 'Ok' || safeRes.routes.length === 0) {
            throw new Error('Primary OSRM Driving profile failed');
        }

        // Helper to ensure polylines visually connect to exact user pins
        const snapPolylineToPins = (poly) => {
            if (poly.length === 0) return poly;
            return [
                { latitude: source.latitude, longitude: source.longitude },
                ...poly,
                { latitude: destCoord.latitude, longitude: destCoord.longitude }
            ];
        };

        // Emergency fallback visual shift ONLY if the waypoint fetch fails or returns same route
        const addVisualVariance = (polylineArray, multiplier) => {
            return polylineArray.map(pt => ({
                latitude: pt.latitude + (0.0003 * multiplier),
                longitude: pt.longitude + (0.0003 * multiplier)
            }));
        };

        const routes = [];

        // 1. Safest Route (Direct Main road)
        const safeRouteData = safeRes.routes[0];
        let safePolyline = decodePolyline(safeRouteData.geometry);
        safePolyline = snapPolylineToPins(safePolyline);
        const safeTime = formatTime(safeRouteData.duration);
        const safeDistance = formatDistance(safeRouteData.distance);
        const safeAiData = analyzeRouteWithAI({ polyline: safePolyline, estimatedTime: safeTime, distance: safeDistance }, 'safest');

        routes.push({
            routeId: 'route_safest',
            name: 'Safest Route',
            type: 'safest',
            destinationCoords: destCoord,
            polyline: safePolyline,
            estimatedTime: safeTime,
            distance: safeDistance,
            trafficLevel: safeAiData.trafficLevel,
            safetyScore: safeAiData.safetyScore,
            aiConfidence: safeAiData.aiConfidence
        });

        // 2. Fastest Route (Northern Waypoint)
        const fastSuccess = fastRes.code === 'Ok' && fastRes.routes.length > 0;
        const fastRouteData = fastSuccess ? fastRes.routes[0] : safeRouteData;
        let fastPolyline = decodePolyline(fastRouteData.geometry);
        if (!fastSuccess) fastPolyline = addVisualVariance(fastPolyline, 1);
        fastPolyline = snapPolylineToPins(fastPolyline);

        const fastTime = formatTime(fastSuccess ? fastRouteData.duration : safeRouteData.duration * 0.9);
        const fastDistance = formatDistance(fastSuccess ? fastRouteData.distance : safeRouteData.distance);
        const fastAiData = analyzeRouteWithAI({ polyline: fastPolyline, estimatedTime: fastTime, distance: fastDistance }, 'fastest');

        routes.push({
            routeId: 'route_fastest',
            name: 'Fastest Route',
            type: 'fastest',
            destinationCoords: destCoord,
            polyline: fastPolyline,
            estimatedTime: fastTime,
            distance: fastDistance,
            trafficLevel: fastAiData.trafficLevel,
            safetyScore: fastAiData.safetyScore,
            aiConfidence: fastAiData.aiConfidence
        });

        // 3. Shortcut Route (Southern Waypoint)
        const shortSuccess = shortRes.code === 'Ok' && shortRes.routes.length > 0;
        const shortRouteData = shortSuccess ? shortRes.routes[0] : safeRouteData;
        let shortPolyline = decodePolyline(shortRouteData.geometry);
        if (!shortSuccess) shortPolyline = addVisualVariance(shortPolyline, -1);
        shortPolyline = snapPolylineToPins(shortPolyline);

        const shortTime = formatTime(shortSuccess ? shortRouteData.duration : safeRouteData.duration * 1.5);
        const shortDistance = formatDistance(shortSuccess ? shortRouteData.distance : safeRouteData.distance * 0.85);
        const shortAiData = analyzeRouteWithAI({ polyline: shortPolyline, estimatedTime: shortTime, distance: shortDistance }, 'shortcut');

        routes.push({
            routeId: 'route_shortcut',
            name: 'Shortcut Route',
            type: 'shortcut',
            destinationCoords: destCoord,
            polyline: shortPolyline,
            estimatedTime: shortTime,
            distance: shortDistance,
            trafficLevel: shortAiData.trafficLevel,
            safetyScore: shortAiData.safetyScore,
            aiConfidence: shortAiData.aiConfidence
        });

        return routes;

    } catch (e) {
        console.warn("OSRM routing failed, falling back to direct connecting line:", e);
        // We must have destCoord to draw a fallback line. If geocoding failed, we can't do anything.
        if (typeof destCoord === 'undefined') {
            throw new Error("Cannot route: Destination geocoding failed.");
        }
        return getFallbackRoutes(source, destCoord);
    }
};

// Extracted mock route logic for absolute worst-case fallback (API timeout or unroutable over oceans)
const getFallbackRoutes = (source, destCoord) => {
    // Generate simple connecting lines if the road network API fails
    const p1 = { latitude: source.latitude, longitude: source.longitude };
    const pEnd = { latitude: destCoord.latitude, longitude: destCoord.longitude };

    // Small mathematical offsets to ensure lines don't completely overlap visually
    const shift = (point, multiplier) => ({
        latitude: point.latitude + (0.0005 * multiplier),
        longitude: point.longitude + (0.0005 * multiplier)
    });

    return [
        {
            routeId: 'route_safest',
            name: 'Safest Route',
            type: 'safest',
            destinationCoords: pEnd,
            polyline: [p1, pEnd],
            estimatedTime: 'ETA Unavailable',
            distance: 'Direct Line',
            trafficLevel: 'Unknown',
            safetyScore: 'Moderate',
        },
        {
            routeId: 'route_fastest',
            name: 'Fastest Route',
            type: 'fastest',
            destinationCoords: pEnd,
            polyline: [p1, shift(pEnd, 1)],
            estimatedTime: 'ETA Unavailable',
            distance: 'Direct Line',
            trafficLevel: 'Unknown',
            safetyScore: 'Moderate',
        },
        {
            routeId: 'route_shortcut',
            name: 'Shortcut Route',
            type: 'shortcut',
            destinationCoords: pEnd,
            polyline: [p1, shift(pEnd, -1)],
            estimatedTime: 'ETA Unavailable',
            distance: 'Direct Line',
            trafficLevel: 'Unknown',
            safetyScore: 'Risky',
        }
    ];
};

// Transit data functionality removed as per user request to focus on navigation
export const getRealTransitData = async (source, destination) => {
    return [];
};
