// Mock Emergency Service

export const sendLiveLocationToContacts = async (location, contacts) => {
    return new Promise((resolve) => {
        console.log(`Sending Location to contacts`, contacts, location);
        setTimeout(() => resolve(true), 500);
    });
};

export const getEmergencyContacts = async () => {
    return [
        { id: '1', name: 'Dad', phone: '+1234567890' },
        { id: '2', name: 'Mom', phone: '+1987654321' },
        { id: '3', name: 'Brother', phone: '+1122334455' },
    ];
};

export const getNearbySafeZones = async (location) => {
    // Return some mock police stations / hospitals near given location
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                { id: 's1', name: 'City Police Station', type: 'Police', distance: '1.2 km', latitude: 28.71, longitude: 77.11 },
                { id: 's2', name: 'General Hospital', type: 'Hospital', distance: '2.5 km', latitude: 28.72, longitude: 77.12 },
            ]);
        }, 1000);
    });
};
