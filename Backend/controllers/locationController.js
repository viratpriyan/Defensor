const { db } = require('../config/firebase');

const updateLocation = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const userId = req.user.id;

        const locRef = db.collection('locations').doc(userId);

        // This will update existing or create new doc matching userId
        await locRef.set({
            latitude,
            longitude,
            lastUpdated: new Date()
        }, { merge: true });

        res.status(200).json({ success: true, message: 'Location updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

const getLocationHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const doc = await db.collection('locations').doc(userId).get();

        if (!doc.exists) {
            return res.status(404).json({ success: false, message: 'No location history found' });
        }

        res.status(200).json({ success: true, data: doc.data() });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = { updateLocation, getLocationHistory };
