/**
 * Simulated AI/ML Route Analysis Model
 * This utility evaluates raw route data based on distance, duration, and geometry
 * to determine the safety risk and traffic likelihood of a given path.
 */

// Helper to calculate complexity based on coordinates (more points = more turns/intersections)
const calculateRouteComplexity = (polylineCoords) => {
    if (!polylineCoords || polylineCoords.length === 0) return 0;
    return polylineCoords.length;
};

// Helper: Convert "18 mins" or "5.2 km" to numeric values for analysis
const parseNumericValue = (str) => {
    if (!str) return 0;
    const num = parseFloat(str.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
};

/**
 * AI Analyzer: Evaluate a route
 * @param {Object} routeData - Raw route data from OSRM
 * @param {string} routeType - Base type (safest, fastest, shortcut)
 * @returns {Object} { safetyScore, trafficLevel, aiConfidence }
 */
export const analyzeRouteWithAI = (routeData, routeType) => {
    const distanceKm = parseNumericValue(routeData.distance);
    const durationMins = parseNumericValue(routeData.estimatedTime);
    const complexityNodes = calculateRouteComplexity(routeData.polyline);

    // AI Weights & Features
    let safetyScore = 'Safe';
    let trafficLevel = 'Low';
    let aiConfidence = 0;

    // Feature 1: Speed/Pace (Mins per Km)
    // - Very slow pace usually indicates walking/narrow alleys or extremely heavy traffic
    // - Fast pace implies main open roads
    const pace = distanceKm > 0 ? durationMins / distanceKm : 0;

    // Feature 2: Route Complexity (Nodes per Km)
    // - High nodes/km implies many turns, intersections, or narrow winding paths (higher risk)
    const complexityRatio = distanceKm > 0 ? complexityNodes / distanceKm : 0;

    // --- Simulated ML Evaluation Tree --- //

    // 1. Walking/Shortcut profile usually has high duration, short distance, high complexity
    if (routeType === 'shortcut' || pace > 10) { // Pace > 10 mins/km is very slow
        trafficLevel = 'Medium'; // Implicit for walking paths

        // If it's very winding (high complexity) it's considered riskier for safety
        if (complexityRatio > 50) {
            safetyScore = 'Risky';
            aiConfidence = 0.92;
        } else {
            safetyScore = 'Moderate';
            aiConfidence = 0.85;
        }
    }
    // 2. Driving profiles
    else {
        // Evaluate Traffic based on pace (slower than 3 mins/km = heavy traffic usually on city roads)
        if (pace > 4) {
            trafficLevel = 'Heavy';
        } else if (pace > 2) {
            trafficLevel = 'Medium';
        } else {
            trafficLevel = 'Low';
        }

        // Evaluate Safety based on complexity (Main roads have fewer nodes/km than backroads)
        if (complexityRatio > 40) {
            safetyScore = 'Moderate'; // Lots of turns = backroads/neighborhoods
            aiConfidence = 0.88;
        } else {
            safetyScore = 'Safe'; // Straight main roads
            aiConfidence = 0.95;
        }

        // If it's a "fastest" route with heavy traffic, flag it as moderate safety (rushing through traffic)
        if (routeType === 'fastest' && trafficLevel === 'Heavy') {
            safetyScore = 'Moderate';
            aiConfidence = 0.89;
        }
    }

    return {
        safetyScore,
        trafficLevel,
        aiConfidence,
        analyzedFeatures: { pace, complexityRatio }
    };
};
