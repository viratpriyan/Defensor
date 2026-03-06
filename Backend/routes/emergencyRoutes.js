const express = require('express');
const router = express.Router();
const {
    addEmergencyContact,
    getEmergencyContacts,
    triggerSOS,
    triggerDetection,
    getEmergencyHistory,
    shareLocation,
    getSafeZones,
    deleteEmergencyContact,
    updateEmergencyContact
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/add-contact', protect, addEmergencyContact);
router.get('/contacts', protect, getEmergencyContacts);
router.delete('/contact/:id', protect, deleteEmergencyContact);
router.patch('/contact/:id', protect, updateEmergencyContact);
router.post('/sos', protect, triggerSOS);
router.post('/trigger', protect, triggerDetection);
router.get('/history', protect, getEmergencyHistory);
router.post('/share-location', protect, shareLocation);
router.post('/safe-zones', protect, getSafeZones);

module.exports = router;
