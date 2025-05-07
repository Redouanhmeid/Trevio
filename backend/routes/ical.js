const express = require('express');
const router = express.Router();
const {
 syncPropertyICalReservations,
 fetchICalContent,
} = require('../controllers/ICalController');

// Route to sync iCal reservations for a specific property
router.post('/sync/:propertyId', syncPropertyICalReservations);

router.post('/fetch-ical', fetchICalContent);

module.exports = router;
