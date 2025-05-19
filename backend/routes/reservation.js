const express = require('express');
const router = express.Router();
const {
 getReservation,
 getReservations,
 getReservationsByProperty,
 createReservation,
 sendToGuest,
 getReservationContract,
 updateReservation,
 updateReservationStatus,
 deleteReservation,
 getReservationByHash,
 getClientReservations,
 getConciergeReservations,
 generateRevenue,
 generateContract,
 updateElectronicLock,
 checkAvailability,
 checkReservationUID,
 identifierUtilisateur,
 listUserReservations,
} = require('../controllers/ReservationController');

// Get all reservations
router.get('/', getReservations);

// Get single reservation
router.get('/:id', getReservation);

// Get reservations by property
router.get('/property/:propertyId', getReservationsByProperty);

// Create new reservation
router.post('/', createReservation);

// Generate contract for reservation
router.post('/:id/generate-revenue', generateRevenue);

// Get contract for reservation
router.get('/:id/contract', getReservationContract);

// Send reservation to guest
router.post('/:id/send', sendToGuest);

// Update reservation
router.put('/:id', updateReservation);

// Update reservation status
router.put('/:id/status', updateReservationStatus);

// Delete reservation
router.delete('/:id', deleteReservation);

router.get('/hash/:hashId', getReservationByHash);

// Get reservations for properties owned by a client
router.get('/client/:clientId', getClientReservations);

// Get reservations for properties assigned to a concierge
router.get('/concierge/:conciergeId', getConciergeReservations);

// Generate contract for reservation
router.post('/:id/generate-contract', generateContract);

// Electronic lock management
router.patch('/:reservationId/electronic-lock', updateElectronicLock);

// Check availability for a property's date range
router.get('/property/:propertyId/check-availability', checkAvailability);

router.get('/check-uid/:uid', checkReservationUID);

// route for chatbot user identification
router.post('/identifierUtilisateur', identifierUtilisateur);
router.post('/listUserReservations', listUserReservations);

module.exports = router;
