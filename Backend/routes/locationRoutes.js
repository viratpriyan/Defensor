const express = require('express');
const router = express.Router();
const { updateLocation, getLocationHistory } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/update', protect, updateLocation);
router.get('/history', protect, getLocationHistory);

module.exports = router;
