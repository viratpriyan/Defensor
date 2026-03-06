const express = require('express');
const router = express.Router();

router.post('/analyze', (req, res) => {
    res.status(200).json({ success: true, message: 'Route analyzed' });
});

module.exports = router;
