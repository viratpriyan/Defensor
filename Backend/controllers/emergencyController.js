const { db } = require('../config/firebase');
const { sendSMS } = require('../services/smsService');
const axios = require('axios');

const addEmergencyContact = async (req, res) => {
    try {
        const { name, phone, relationship } = req.body;
        const userId = req.user.id;

        if (!name || !phone) {
            return res.status(400).json({ success: false, message: 'Name and phone are required' });
        }

        const newContactRef = db.collection('emergencyContacts').doc();
        await newContactRef.set({
            userId,
            name,
            phone,
            relationship,
            createdAt: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Contact added successfully',
            data: { id: newContactRef.id, name, phone, relationship }
        });
    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getEmergencyContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const snapshot = await db.collection('emergencyContacts').where('userId', '==', userId).get();

        const contacts = [];
        snapshot.forEach(doc => {
            contacts.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ success: true, data: contacts });
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const triggerSOS = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        console.log(`[SOS] Triggered by User: ${userId} at Lat: ${latitude}, Lon: ${longitude}`);

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        const sosRef = db.collection('emergencyEvents').doc();
        await sosRef.set({
            userId,
            triggerType: 'MANUAL_SOS',
            location: { latitude: lat, longitude: lon },
            timestamp: new Date()
        });

        // 1. Fetch the user's emergency contacts
        const snapshot = await db.collection('emergencyContacts').where('userId', '==', userId).get();
        console.log(`[SOS] Found ${snapshot.size} emergency contacts in database`);

        if (snapshot.empty) {
            console.log(`[SOS] No emergency contacts found for user ${userId}`);
            return res.status(200).json({ success: true, message: 'SOS Logged (No contacts to alert)' });
        }

        // 2. Build the Google Maps URL and Message
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        const message = `EMERGENCY ALERT: I need help! My current location is: ${mapsUrl}`;

        // 3. Send SMS to each contact
        const smsResults = [];
        const contacts = [];
        snapshot.forEach(doc => {
            const contact = doc.data();
            contacts.push(contact.phone);
            smsResults.push(sendSMS(contact.phone, message));
        });

        console.log(`[SOS] Attempting to send SMS to: ${contacts.join(', ')}`);
        const results = await Promise.all(smsResults);
        const totalSent = results.filter(r => r === true).length;

        console.log(`[SOS] Completed. Sent: ${totalSent}/${contacts.length}`);

        res.status(200).json({
            success: true,
            message: `SOS Triggered. Alerts successfully sent to ${totalSent}/${contacts.length} contacts.`
        });
    } catch (error) {
        console.error('[SOS] Error in TriggerSOS:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const triggerDetection = async (req, res) => {
    try {
        const { latitude, longitude, triggerType } = req.body;
        const userId = req.user.id;

        const eventRef = db.collection('emergencyEvents').doc();
        await eventRef.set({
            userId,
            triggerType,
            location: { latitude, longitude },
            timestamp: new Date()
        });

        res.status(200).json({ success: true, message: `${triggerType} Alert Triggered` });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getEmergencyHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const snapshot = await db.collection('emergencyEvents').where('userId', '==', userId).get();

        const events = [];
        snapshot.forEach(doc => {
            events.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const shareLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;
        console.log(`[ShareTracker] Started by User: ${userId} at Lat: ${latitude}, Lon: ${longitude}`);

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        const snapshot = await db.collection('emergencyContacts').where('userId', '==', userId).get();
        console.log(`[ShareTracker] Found ${snapshot.size} emergency contacts in database`);

        if (snapshot.empty) {
            console.log(`[ShareTracker] No emergency contacts found for user ${userId}`);
            return res.status(200).json({ success: true, message: 'Tracking started (No contacts to alert)' });
        }

        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
        const message = `SAFE TRACKING: I am starting a journey. You can track my initial location here: ${mapsUrl}`;

        const smsResults = [];
        const contacts = [];
        snapshot.forEach(doc => {
            const contact = doc.data();
            contacts.push(contact.phone);
            smsResults.push(sendSMS(contact.phone, message));
        });

        console.log(`[ShareTracker] Attempting to send SMS to: ${contacts.join(', ')}`);
        const results = await Promise.all(smsResults);
        const totalSent = results.filter(r => r === true).length;

        console.log(`[ShareTracker] Completed. Sent: ${totalSent}/${contacts.length}`);

        res.status(200).json({
            success: true,
            message: `Tracking Started. Alerts successfully sent to ${totalSent}/${contacts.length} contacts.`
        });
    } catch (error) {
        console.error('[ShareTracker] Error in shareLocation:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const deleteEmergencyContact = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const contactRef = db.collection('emergencyContacts').doc(id);
        const contact = await contactRef.get();

        if (!contact.exists || contact.data().userId !== userId) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        await contactRef.delete();
        res.status(200).json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Delete Contact Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const updateEmergencyContact = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, relationship } = req.body;
        const userId = req.user.id;

        const contactRef = db.collection('emergencyContacts').doc(id);
        const contact = await contactRef.get();

        if (!contact.exists || contact.data().userId !== userId) {
            return res.status(404).json({ success: false, message: 'Contact not found' });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;
        if (relationship) updateData.relationship = relationship;

        await contactRef.update(updateData);
        res.status(200).json({
            success: true,
            message: 'Contact updated successfully',
            data: { id, ...contact.data(), ...updateData }
        });
    } catch (error) {
        console.error('Update Contact Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getSafeZones = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        console.log(`[SafeZones] Request: Lat ${latitude}, Lon ${longitude}`);

        const lat = parseFloat(latitude);
        const lon = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json({ success: false, message: 'Invalid coordinates' });
        }

        const radius = 5000;
        const query = `[out:json][timeout:30];(node["amenity"~"hospital|police|pharmacy"](around:${radius},${lat},${lon});node["tourism"="hotel"](around:${radius},${lat},${lon});node["shop"="supermarket"](around:${radius},${lat},${lon}););out body;>;out skel qt;`;

        const url = 'https://overpass-api.de/api/interpreter';

        const response = await axios({
            method: 'post',
            url: url,
            data: `data=${encodeURIComponent(query)}`,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 30000
        });

        if (!response.data || !response.data.elements) {
            return res.status(500).json({ success: false, message: 'Invalid response from mapping service' });
        }

        const zones = response.data.elements
            .filter(el => el.lat && el.lon)
            .map(el => ({
                id: el.id.toString(),
                name: el.tags.name || el.tags.amenity || el.tags.tourism || el.tags.shop || 'Safety Landmark',
                type: el.tags.amenity || el.tags.tourism || el.tags.shop || 'Landmark',
                latitude: el.lat,
                longitude: el.lon,
                address: el.tags['addr:street'] ? `${el.tags['addr:street']} ${el.tags['addr:housenumber'] || ''}` : 'Local Area'
            }));

        console.log(`[SafeZones] Found ${zones.length} locations`);
        res.status(200).json({ success: true, data: zones });
    } catch (error) {
        console.error('[SafeZones] Proxy Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch safe zones' });
    }
};

module.exports = {
    addEmergencyContact,
    getEmergencyContacts,
    triggerSOS,
    triggerDetection,
    getEmergencyHistory,
    shareLocation,
    getSafeZones,
    deleteEmergencyContact,
    updateEmergencyContact
};
